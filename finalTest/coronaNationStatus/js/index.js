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
        pageHelper.lastPageContainer.innerHTML = parseInt(pageHelper.lastPage);
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
    init()
    getData()
        .then(makeDataList)
        .then(getPage);
})
function init() {
    tableBody = document.getElementById("tbody");
    pageHelper.pageContainer = document.getElementById('pageContainer');
    pageHelper.lastPageContainer = document.getElementById('lastPageContainer');
    pageHelper.reloadPage();
    drawDay();
}
function drawDay() {
    const todayDiv = document.getElementById("today");
    todayDiv.innerHTML=`${date.getFullYear()}. ${date.getMonth()+1}. ${date.getDate()-3}`
}
function getData() {
    const today = date.getFullYear() + "" + "0" + (date.getMonth() + 1) + "" + (date.getDate()-3);
    return new Promise((resolve, reject) => {
        const serviceKey = cityCorona.apikey;
        const xhr = new XMLHttpRequest();
        const url = 'http://openapi.data.go.kr/openapi/service/rest/Covid19/getCovid19NatInfStateJson'; /*URL*/
        let queryParams = '?' + encodeURIComponent('serviceKey') + '=' + serviceKey; /*Service Key*/
        queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /**/
        queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('10'); /**/
        queryParams += '&' + encodeURIComponent('startCreateDt') + '=' + encodeURIComponent(today); /**/
        queryParams += '&' + encodeURIComponent('endCreateDt') + '=' + encodeURIComponent(today); /**/
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
    return new Promise((resolve, reject) => {
        let itemList = [];
        const items = xmlDoc.getElementsByTagName("item");
        for (let i = 0; i < items.length; i++) {
            let nationNm = items[i].getElementsByTagName("nationNm")[0].innerHTML;
            let nationNmEn = items[i].getElementsByTagName("nationNmEn")[0].innerHTML;
            let createDt = items[i].getElementsByTagName("createDt")[0].innerHTML;
            let natDefCnt = items[i].getElementsByTagName("natDefCnt")[0].innerHTML;
            let natDeathCnt = items[i].getElementsByTagName("natDeathCnt")[0].innerHTML;
            let seq = items[i].getElementsByTagName("seq")[0].innerHTML;
            let stdDay = items[i].getElementsByTagName("stdDay")[0].innerHTML;

            let item = {
                nationNm, //?????????
                nationNmEn, // ?????? ?????????
                createDt, //??????????????????
                natDefCnt, //????????? ????????????
                natDeathCnt, //????????? ????????????
                seq, //??????????????????
                stdDay, //?????????
            }
            itemList.push(item);
        }
        itemList.reverse();
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
                alert("??? ?????? ????????? ?????????.")
        }
        
    })

    nextBtn.addEventListener("click", () => {
        if (pageHelper.page + 1 < pageHelper.lastPage) {
            pageHelper.plusPage(itemList);
            clearTbody();
            drawTbody();
        } else {
            alert("????????? ????????? ?????????.")
        }
    })

    geoChart(itemList);
}

function clearTbody() {
    tableBody.innerHTML = "";
}

function drawTbody() {
    for (let i = 0; i < pageHelper.pageItems.length; i++){
        const trTemplate = `<tr>
                <td>
                    <a href="./coronaNationDayStatus.html?nation=${pageHelper.pageItems[i].nationNm}">${pageHelper.pageItems[i].nationNm}</a>
                </td>
                <td>${parseInt(pageHelper.pageItems[i].natDefCnt).toLocaleString('ko-KR')}</td>
                <td>${parseInt(pageHelper.pageItems[i].natDeathCnt).toLocaleString('ko-KR')}</td>
            </tr>`
        tableBody.insertAdjacentHTML("beforeend", trTemplate);
    }
}

function geoChart(itemList) {
    console.log(itemList)
    const dataList = [];
    dataList.push(['Country', '????????????']);
    for (let i = 0; i < itemList.length; i++){
        dataList.push([itemList[i].nationNmEn,parseInt(itemList[i].natDefCnt)]);
    }
    console.log(dataList)
    google.charts.load('current', {
        'packages':['geochart'],
      });
      google.charts.setOnLoadCallback(drawRegionsMap);

    function drawRegionsMap() {
        var data = google.visualization.arrayToDataTable(dataList);

        var options = {};

        var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));

        chart.draw(data, options);
    }
}