window.addEventListener("load", () => {
    getData(drawTd);
})

function getData(drawTd) {
    const serviceKey = corona.apikey;

    const xhr = new XMLHttpRequest();
    const url = 'http://openapi.data.go.kr/openapi/service/rest/Covid19/getCovid19InfStateJson'; /*URL*/
    let queryParams = '?' + encodeURIComponent('serviceKey') + '=' + serviceKey; /*Service Key*/
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /**/
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('10'); /**/
    queryParams += '&' + encodeURIComponent('startCreateDt') + '=' + encodeURIComponent('20220301'); /**/
    queryParams += '&' + encodeURIComponent('endCreateDt') + '=' + encodeURIComponent('20220322'); /**/
    let itemList = [];
    xhr.open('GET', url + queryParams);
    xhr.onreadystatechange = function () { // 이 메서드 분리하기
        if (this.readyState == 4) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(this.responseText, "text/xml");
            const items = xmlDoc.getElementsByTagName("item");
            for (let i = 0; i < items.length; i++) {
                let createDt = items[i].getElementsByTagName("createDt")[0].innerHTML;
                let decideCnt = items[i].getElementsByTagName("decideCnt")[0].innerHTML;
                let deathCnt = items[i].getElementsByTagName("deathCnt")[0].innerHTML;
                let seq = items[i].getElementsByTagName("seq")[0].innerHTML;
                let stateDt = items[i].getElementsByTagName("stateDt")[0].innerHTML;
                let updateDt = items[i].getElementsByTagName("updateDt")[0].innerHTML;

                let item = {
                    createDt, //등록일시분초
                    decideCnt, //확진자수
                    deathCnt, //사망자수
                    seq, //게시글고유값
                    stateDt, //기준일
                    updateDt //수정일시분초
                }
                itemList.push(item);
            }
            itemList.reverse();
            drawTd(itemList)
        }
    };
    xhr.send('');
}

function drawTd(itemList) {
    const coronaTbody = document.getElementById("coronaData");
    for (let i = 0; i < itemList.length; i++){
        const coronaTd =`<tr><td id="createDt">${itemList[i].createDt}</td>
            <td id="decideCnt">${itemList[i].decideCnt}</td>
            <td id="deathCnt">${itemList[i].deathCnt}</td>
            <td id="updateDt">${itemList[i].updateDt}</td></tr>`;
        coronaTbody.innerHTML += coronaTd;
    }
    drawList = itemList;
    google.charts.load('current', {'packages':['line']});
    google.charts.setOnLoadCallback(drawChart);
}


function drawChart() {

    let dataList = [];
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Day');
    data.addColumn('number', '확진자(누적)');
    data.addColumn('number', '사망자(누적)');
    
    for (let i = 0; i < drawList.length; i++) {
        let a = [drawList[i].stateDt, parseInt(drawList[i].decideCnt), parseInt(drawList[i].deathCnt)];
        dataList.push(a);
        console.log(dataList);
    }

    data.addRows(dataList);

    var options = {
        chart: {
            title: 'COVID-19',
            subtitle: 'Korea 누적 확진/사망자 수'
        },
        width: 900,
        height: 500
    };

    var chart = new google.charts.Line(document.getElementById('linechart_material'));

    chart.draw(data, google.charts.Line.convertOptions(options));
}
