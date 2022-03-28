let tableBody;
const date = new Date();

const pageHelper = {
    pagingSize:8,
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
    reloadPage: () => { pageHelper.pageContainer.innerHTML = parseInt(pageHelper.page + 1); },
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
    tableBody = document.getElementById('tbody');
    pageHelper.pageContainer = document.getElementById('pageContainer');
    pageHelper.lastPageContainer = document.getElementById('lastPageContainer');
    pageHelper.reloadPage();
    drawDay();
}

function drawDay() {
    const todayDiv = document.getElementById("today");
    todayDiv.innerHTML=`${date.getFullYear()}. ${date.getMonth()+1}. ${date.getDate()-1}` 
}

function getData() {
    const today = date.getFullYear() + "" + "0" + (date.getMonth() + 1) + "" + (date.getDate()-1); 
    return new Promise((resolve, reject) => {
        const serviceKey = cityCorona.apikey;
        const xhr = new XMLHttpRequest();
        const url = 'http://openapi.data.go.kr/openapi/service/rest/Covid19/getCovid19SidoInfStateJson'; /*URL*/
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
}

function clearTbody() {
    tableBody.innerHTML = "";
}

function drawTbody() {
    for (let i = 0; i < pageHelper.pageItems.length; i++){
        const trTemplate = `<tr>
                <td>
                    <a href="./dayCorona.html?gubun=${pageHelper.pageItems[i].gubun}">${pageHelper.pageItems[i].gubun}</a>
                </td>
                <td>${parseInt(pageHelper.pageItems[i].defCnt).toLocaleString('ko-KR')}</td>
                <td>${parseInt(pageHelper.pageItems[i].deathCnt).toLocaleString('ko-KR')}</td>
            </tr>`
        tableBody.insertAdjacentHTML("beforeend", trTemplate);
    }
}