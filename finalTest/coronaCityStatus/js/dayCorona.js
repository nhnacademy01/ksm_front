let selectGubun;
let tableBody;
const date = new Date();

const pageHelper = {
    pagingSize:10,
    page: 0,
    lastPage: 0,
    pageContainer: "",
    lastPageContainer:"",
    pageItems: [],
    plusPage: (itemList) => {
        pageHelper.page += 1;
        pageHelper.reloadPage();
        pageHelper.getPageItemsList(itemList);
    },
    subPage: (itemList) => {
        pageHelper.page -= 1;
        pageHelper.reloadPage();
        pageHelper.getPageItemsList(itemList);
    },
    reloadPage: () => { this.pageContainer.innerHTML = parseInt(pageHelper.page + 1); },
    initPage: (itemList) => {
        pageHelper.lastPageContainer.innerHTML = parseInt(pageHelper.lastPage + 1);
        pageHelper.getPageItemsList(itemList);
        drawTbody();
    },
    getPageItemsList: (itemList) => {
        let items = [];
        for (let i = pageHelper.page * pageHelper.pagingSize; i < pageHelper.pagingSize + pageHelper.page * pageHelper.pagingSize; i++){
            if (itemList[i] === undefined) {
                break;
            }
            items.push(itemList[i]);
        }
        pageHelper.pageItems = items;
    },
    setLastPage: (itemListLength) => {
        pageHelper.lastPage = itemListLength / pageHelper.pagingSize;
    }
}

window.addEventListener("load", () => {
    init();
    getData()
        .then(makeDataList)
        .then(getPage);
})

function init() {
    getUrlParam();
    drawHeader();
    tableBody = document.getElementById('tbody');
    pageHelper.pageContainer = document.getElementById('pageContainer');
    pageHelper.lastPageContainer = document.getElementById('lastPageContainer');
    pageHelper.reloadPage();
}

function getUrlParam() {
    const url = new URL(window.location.href);
    const urlParmas = url.searchParams;
    selectGubun = urlParmas.get('gubun');
}

function drawHeader() {
    document.getElementById('regionContainer').innerHTML = `${selectGubun}`
    document.getElementById('standard').innerHTML=`${date.getFullYear()}년 ${date.getMonth()+1}월 현황`
}

function getData() {
    const startCreateDt = date.getFullYear() + "" + "0" + (date.getMonth() + 1) + "01";
    const endCreateDt = date.getFullYear() + "" + "0" + (date.getMonth() + 1) + "" + (date.getDate()-1);
    return new Promise((resolve, reject) => {
        const serviceKey = cityCorona.apikey;
        const xhr = new XMLHttpRequest();
        const url = 'http://openapi.data.go.kr/openapi/service/rest/Covid19/getCovid19SidoInfStateJson'; /*URL*/
        let queryParams = '?' + encodeURIComponent('serviceKey') + '=' + serviceKey; /*Service Key*/
        queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /**/
        queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('10'); /**/
        queryParams += '&' + encodeURIComponent('startCreateDt') + '=' + encodeURIComponent(startCreateDt); /**/
        queryParams += '&' + encodeURIComponent('endCreateDt') + '=' + encodeURIComponent(endCreateDt); /**/
        xhr.open('GET', url + queryParams);
        xhr.onreadystatechange = function () {
            if (this.readyState == 4) {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(this.responseText, "text/xml");
                resolve(xmlDoc);
            }
        };
        xhr.send('');
    })
}

function makeDataList(xmlDoc) {
    return new Promise((resolve, result) => {
        let itemList = [];
        const items = xmlDoc.getElementsByTagName("item");
        for (let i = 0; i < items.length; i++) {
            let gubun = items[i].getElementsByTagName("gubun")[0].innerHTML;
            let createDt = items[i].getElementsByTagName("createDt")[0].innerHTML;
            let defCnt = items[i].getElementsByTagName("defCnt")[0].innerHTML;
            let deathCnt = items[i].getElementsByTagName("deathCnt")[0].innerHTML;
            let seq = items[i].getElementsByTagName("seq")[0].innerHTML;
            let stdDay = items[i].getElementsByTagName("stdDay")[0].innerHTML;
            let updateDt = items[i].getElementsByTagName("updateDt")[0].innerHTML;

            let item = {
                gubun, //도시
                createDt, //등록일시분초
                defCnt, //확진자수
                deathCnt, //사망자수
                seq, //게시글고유값
                stdDay, //기준일
                updateDt //수정일시분초
            }
            if (item.gubun === selectGubun) {
                itemList.push(item);
            }
        }
        pageHelper.setLastPage(itemList.length);
        resolve(itemList);
    })
}

function getPage(itemList) {
    const beforeBtn = document.getElementById('beforeBtn');
    const nextBtn = document.getElementById('nextBtn');
    pageHelper.initPage(itemList);
    beforeBtn.addEventListener("click", () => {
        if (pageHelper.page > 0) {
            pageHelper.subPage(itemList);
            clearTbody();
            drawTbody();
            } else {
                alert("첫 번째 페이지 입니다.")
        }
        
    })

    nextBtn.addEventListener("click", () => {
        if (pageHelper.page + 1 < pageHelper.lastPage) {
            pageHelper.plusPage(itemList);
            clearTbody();
            drawTbody();
        } else {
            alert("마지막 페이지 입니다.")
        }
    })

    chart(itemList);
}

function clearTbody() {
    tableBody.innerHTML = "";
}

function drawTbody() {
    for (let i = 0; i < pageHelper.pageItems.length; i++){
        const trTemplate = `<tr>
                <td>${pageHelper.pageItems[i].createDt}</td>
                <td>${parseInt(pageHelper.pageItems[i].defCnt).toLocaleString('ko-KR')}</td>
                <td>${parseInt(pageHelper.pageItems[i].deathCnt).toLocaleString('ko-KR')}</td>
            </tr>`
        tableBody.insertAdjacentHTML("beforeend", trTemplate);
    }
}

function chart(itemList) {
    google.charts.load('current', {'packages':['line']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        let dataList = [];
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Day');
        data.addColumn('number', '확진자(누적)');
        data.addColumn('number', '사망자(누적)');
            
        for (let i = itemList.length-1; i > -1; i--) {
            let a = [itemList[i].stdDay, parseInt(itemList[i].defCnt), parseInt(itemList[i].deathCnt)];
            dataList.push(a);
        }

        data.addRows(dataList);

        var options = {
            chart: {
                title: 'COVID-19',
                subtitle: selectGubun+' 누적 확진/사망자 수'
            },
            width: 800,
            height: 400
        };

        var chart = new google.charts.Line(document.getElementById('linechart_material'));

        chart.draw(data, google.charts.Line.convertOptions(options));
    }

}
