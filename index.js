document.addEventListener('DOMContentLoaded', function(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://cdn.rawgit.com/jeffw16/utd-grade-distributions/09c9b71584da99d66cb8acc09d58d0c50415ecf4/static/complete.json', true);
    // xhr.open('GET', 'https://www.google.com/blank.html', true);
    xhr.responseType = 'json';
    // console.log('started loading db');
    xhr.onload = function(e) {
        window.db = new Nedb();
        // console.log('done loading db');
        window.db.insert(this.response, (err) =>{
            if(err) console.error(err);
            // console.log('done initializing db');
            if(window.waiting){
                findClasses();
            }
        });
    };
    xhr.send();
})

function escapeRegex(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

//creates a new regexp that checks if a string is contained within the input.
function generateContainsRegex(str){
    return new RegExp(escapeRegex(str), 'i');
}

//search for classes if enough input is given
function instantFind() {
    var subject = document.getElementById('subject').value;
    var num = document.getElementById('course').value;
    var professor = document.getElementById('instructor').value;

    var count = (!!subject) + (!!num) + 2*(!!professor);
    // console.log(count);

    if(count >= 2) {
        findClasses();
    }
}

function findClasses() {
    var select_result = document.getElementById('select_result');
    select_result.innerHTML = "loading...";
    if(!window.db){
        window.loading = true;
        return;
    }
    window.db.find(generateQuery())
        .sort({ subj: 1, num: 1, sect: 1 })
        .exec((err, docs) => {
            // console.log(docs);
            if(docs.length == 0){
                select_result.innerHTML = "No results were found. Try modifying your query. While we strive to keep a complete record, we do not have data on certain classes with low enrollment due to FERPA regulations.";
            } else {
                select_result.innerHTML = "";
                for ( var i = 0; i < docs.length; i++ ) {
                    var item = document.createElement('li');
                    let entry = docs[i]; // use "let" instead of "var" so variable scope is local
                    item.appendChild(document.createTextNode(formatResult(entry)));
                    item.style.color = "#2f843e";
                    item.style.cursor = 'pointer';
                    item.onclick = function(){ compileChart(entry); };
                    document.getElementById('select_result').append(item);
                }
            }
        });
}

function generateQuery() {
  var query = {
        // term: document.getElementById('semester').value,
        subj: generateContainsRegex(document.getElementById('subject').value),
        num: generateContainsRegex(document.getElementById('course').value),
        prof: generateContainsRegex(document.getElementById('instructor').value),
  };
  if ( document.getElementById('semester').value !== 'all' ) {
    query['term'] = document.getElementById('semester').value;
  }
  return query;
}

function formatResult( result ) {
    return result.subj + " " + result.num + "." + result.sect + " (" + result.prof + ") - " + result.term;
}

function randomColor() {
    var color = '#';
    var letters = '0123456789ABCDEF'.split('');
    for(var i = 0; i < 3; i++){
        color += letters[Math.floor(Math.random()*4+8)];
        color += letters[Math.floor(Math.random()*16)];
    }
    return color;
}

// from Stack Overflow https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript/901144#901144
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function compileChart( result ) {
    var {term, subj, num, sect, prof, grades} = result;
    var total = Object.values(grades).reduce((a, b) => a+parseInt(b), 0);
    var colors = ['#2db33f', '#30c737', '#6bd40f', '#93d10d', '#cdff4f', '#ffe14d', '#ffd036', '#ffad33', '#ff704d', '#f518a9', '#a851a8', '#96d529'];
    var myChart = Highcharts.chart('chart', {
        chart: {
          type: 'column'
        },
        title: {
          text: subj + ' ' + num + '.' + sect
        },
        subtitle:{
          text: prof + ' - ' + term
        },
        legend: {
          enabled: false
        },
        xAxis: {
          title: {
            text: 'Grades'
          },
          categories: Object.keys(grades).map((grade) => grade || 'Ungraded')
        },
        yAxis: {
          title: {
            text: 'Students'
          }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: `
                <tr>
                    <td style="color:{series.color};padding:0">{series.name}: </td>
                    <td style="padding:0"><b>{point.y}</b></td>
                </tr>
                <tr>
                    <td style="color:{series.color};padding:0">Percentage: </td>
                    <td style="padding:0"><b>{point.percentage:.2f}%</b></td>
                </tr>
                `,
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        series: [{
          name: 'Students',
          data: Object.values(grades).map((num, i) => {
                return {
                    y: parseInt(num),
                    color: colors[i] || randomColor(),
                    percentage: num/total*100
                };
          })
        }]
    });
    var totalgrades = 0;
    Object.values(grades).forEach((num) => {
      totalgrades += parseInt(num);
    });
    $('#stats').text('Total grades: ' + totalgrades);
    $('#sharelink').val(window.location.href + '?term=' + encodeURIComponent(term) + '&subj=' + encodeURIComponent(subj) + '&num=' + encodeURIComponent(num) + '&sect=' + encodeURIComponent(sect) + '&prof=' + encodeURIComponent(prof) + '&grades=' + encodeURIComponent(btoa(JSON.stringify(grades))));
    $('#share').show();
}
