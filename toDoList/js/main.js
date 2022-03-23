const calenderTable = document.getElementById("calenderTable");

const inputBox = `<span id="span"><input id="inputBox" type="input" placeholder="할 일을 입력하세요">
    <input id="inputBtn" type="button" value="추가" ></span>`

let todos = [];

window.onload=()=>{
    makeCalender();
   if(localStorage.getItem('todoList')!=null){
       
        todos = JSON.parse(localStorage.getItem('todoList'));
        console.log(todos)
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

let todoid = 0;
calenderTable.onclick = function(e){ // 이벤트 위임
    if(e.target.id=='inputBtn'){
        const todoContent = e.target.parentNode.firstChild.value;
        //여기 투두id 수정하기
        const toDo = `<span id ="${todoid}"><div>${todoContent}</div><input id="deleteBtn" type="button" value="삭제" /></span>`
        const todoBox = e.target.parentNode.parentNode.parentNode.lastChild;
        const day = todoBox.parentNode.id;
        todos.push({id:day+"-"+todoid,day:day,todo:toDo});
        localStorage.setItem('todoList',JSON.stringify(todos));
        todoBox.innerHTML+=toDo;
    }//여기 삭제 수정하기
    if(e.target.id=='deleteBtn'){
        const deleteDay = e.target.parentNode.parentNode.parentNode.id;
        console.log(todoBox);
        console.log(todos);
    }
    todoid++;
}

function makeCalender(){
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
                    const dayToDoList = document.createElement("div");
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

