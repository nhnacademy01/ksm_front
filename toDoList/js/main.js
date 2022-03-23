const calenderTable = document.getElementById("calenderTable");

const inputBox = `<span id="span"><input id="inputBox" type="input" placeholder="할 일을 입력하세요">
    <input id="inputBtn" type="button" value="추가" ><input id="allDelBtn" type="button" value="전체 삭제" ></span>`

let todos = [];
let todoid = 0;

window.onload=()=>{
    drawCalender();
    if(localStorage.getItem('todoId')!=null){
        todoid=localStorage.getItem('todoId');
    } else {
        todoid = 0;
    }
    if(localStorage.getItem('todoList')!=null){
        todos = JSON.parse(localStorage.getItem('todoList'));
        for(let i =1;i<32;i++){
            let a = todos.filter(todo=>todo.day==="day"+i);
            if(a!=null){
                for(value of a){
                    document.getElementById("dayToDoListday"+i).innerHTML+=value.todo;
                }
            }   
        }
    }
}

calenderTable.onclick = function (e) {
    // 추가
    if (e.target.id === 'inputBtn') {
        addToDo(e);
    }
    // 삭제
    if(e.target.id==='deleteBtn'){
        deleteToDo(e);
    }
    // 전체 삭제
    if (e.target.id === 'allDelBtn') {
        deleteOneDayToDo(e);
    }
}

function deleteOneDayToDo(e) {
    const allDeleteDay = e.target.parentNode.parentNode.parentNode.id;
    todos = todos.filter(todo => todo.day != allDeleteDay);
    localStorage.setItem('todoList', JSON.stringify(todos));
    window.location.reload();
}

function deleteToDo(e) {
    const deleteDay = e.target.parentNode;
    todos = todos.filter(todo => todo.id != deleteDay.id);
    localStorage.setItem('todoList', JSON.stringify(todos));
    window.location.reload();
}

function addToDo(e) {
    todoid++;
    localStorage.setItem('todoId', todoid);
    const inputToDo = e.target.parentNode.firstChild;
    const todoContent = inputToDo.value;
    const todoBox = e.target.parentNode.parentNode.parentNode.lastChild;
    const day = todoBox.parentNode.id;
    if (todoContent != "") { 
        const toDo = `<div id ="${day + "-" + todoid}" style="display:flex"><div>${todoContent}</div><input id="deleteBtn" type="button" value="❌" /></div>`
        todos.push({ id: day + "-" + todoid, day: day, todo: toDo });
        localStorage.setItem('todoList', JSON.stringify(todos));
        todoBox.innerHTML += toDo;
    }
    inputToDo.value = "";
}

function drawCalender(){
    let weekNo =1;
    let dayNo = 1;
    
    for(let i =0;i<5;i++){
        if(dayNo<32){
            const week = document.createElement("tr");
            week.id = weekNo;
            for(let j =0;j<7;j++){
                if(dayNo<32){
                    let day = document.createElement("td");
                    const dayDiv1 = document.createElement("div");
                    const dayDiv2 = document.createElement("div");
                    const dayToDoList = document.createElement("section");
                    day.id="day"+dayNo;
                    dayToDoList.id = "dayToDoList"+day.id;
                    dayDiv1.innerHTML = dayNo;
                    dayDiv2.innerHTML = inputBox;
                    day.appendChild(dayDiv1);
                    day.appendChild(dayDiv2);
                    day.appendChild(dayToDoList);
                    week.appendChild(day);
                    dayNo++;
                }else{break;}
            }
            weekNo++;
            calenderTable.appendChild(week);
        }else{
            break;
        }
    }
}

