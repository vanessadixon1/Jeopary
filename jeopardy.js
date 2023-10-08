const button = $("<button>").text("Start");

$("body").append(button);

let categories = [];

async function getCategoryIds() {

    try {
        const id = new Set();
        let idList = [];
        let ids;
        
         let url = "http://jservice.io/api/categories";
    
         const data = (await axios.get(url, {params: {count:100}})).data;
    
         data.map((data) => {
            idList.push(data.id);
         })

        while(id.size < 6) {
            let index = Math.floor(Math.random() * idList.length);
            id.add(idList[index]);
        }
        ids = [...id];
        
        return ids;
    } catch(e) {
        console.log(e.message);

    }
}

async function getCategory(catId) {
    try {
        let url = "http://jservice.io/api/category";

        const res = (await axios.get(url, {params: {id:catId}})).data;

        let title = res.title;
        let cluesList = res.clues;
        
        let clues = [];

        const randomQuestionIndex = randomNumber(cluesList);
        const randomQuestions = cluesList.slice(randomQuestionIndex, randomQuestionIndex+5);

        while(clues.length < 5 && randomQuestions !== []) {
            randomQuestions.map((res) => {

                let question = res.question;
                let answer = res.answer;
                
                clues.push({question, answer, showing: null})
            })
    }
    let category = {title, clues};
    return category;
    } catch(e) {
        console.log(e.message);
    }
}

function randomNumber(arr) {
    return Math.floor(Math.random() * arr.length-1);
}

async function addCategory() {
    try {
        getCategoryIds().then((res) => {
            res.forEach((index) => {
                getCategory(index).then((cat) => {
                    categories.push(cat)
                })
            })
        })

    } catch(e) {
        console.log(e.message);
    }
}

function fillTable() {
    let CATEGORY = 6;
    let CLUES = 5;
   
    setTimeout(() => {
        const thead = $("thead");
        const tbody = $("tbody");

        let firstRow = $("<tr>")

        for(let cat of categories) {
            const td = $("<td>");
            firstRow.append(td)
            td.text(cat.title)
        }
        
        thead.append(firstRow)

        for(let row = 0; row < CLUES; row++) {
            const tr = $("<tr>");
            for(let col = 0; col < CATEGORY; col++) {
                const td = $("<td>");

                td.attr("id", `${row}-${col}`);
                td.text("?");
                tr.append(td);
            }
            tbody.append(tr);
        }

    },700);
}

function handleClick(evt) {
        let index = evt.target.id.split("");
        let obj = categories[index[index.length-1]].clues[index[0].trim()];
        let {question, answer, showing} = obj;
        if(showing === null) {
            evt.target.innerText = question;
            obj.showing = "question";
        }else if(showing === "question") {
            obj.showing = "answer";
            evt.target.innerText = answer;
            console.dir(evt.target);
            evt.target.style.backgroundColor = "#28a200";
        }else if(showing === answer) {

        }
}

function showLoadingView() {
    let img = $("<img>").attr({"src": "/loading.gif", "alt":"loading jumping dots", "width": "300px", "height": "300px"});

   if(button.text() === "Start") {
        button.text("Loading...")  
        $("body").append(img);
        if(button.text() === "Loading...") {
            setTimeout(() => {
                img.remove();
                setupAndStart();
                button.text("Restart");
            },900)
        }
   } else if(button.text() === "Restart") {
        categories = [];
       
        $("tr").remove();
        $("tb").remove();

        button.text("Loading...");
       
        $("body").append(img);

        hideLoadingView(img,button);
    }
}

function hideLoadingView(img, button) {
    setTimeout(() => {
        img.remove();
        addCategory();
        fillTable();
        button.text("Restart");
    },1200)

}

async function setupAndStart() {

    $.when(getCategoryIds(), addCategory()).done(() => {
        fillTable()

        $("body").ready(() => {
            $("tbody").on("click", handleClick);
        })
    })
   
}

$("button").on("click", showLoadingView);
