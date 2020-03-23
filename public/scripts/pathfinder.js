/*
    Jacky Tea
    Gridlock Pathfinder
    pathfinder.js
    
    A pathfinding algorithm visualization.
*/

//global coordinates initialization
let startPoint = 0;
let endPoint = 0;
let prevStartPoint = 0;
let prevEndPoint = 0;
let startOrEnd = 1; //1 is start, 2 is end

//set start and end coordinates
function setStartOrEnd(id) {
    if (startOrEnd === 1) {
        document.getElementById(prevStartPoint.toString()).innerHTML = "";
        document.getElementById(prevStartPoint.toString()).style.background = "grey";
        prevStartPoint = id;
        startPoint = id;

        let startText = document.createTextNode("S");
        let startSpan = document.createElement("span");
        startSpan.style.fontWeight = "bold";
        startSpan.style.padding = "0";
        startSpan.style.margin = "0";
        startSpan.style.position = "absolute";
        startSpan.style.fontSize = "24px";
        startSpan.style.top = "50%";
        startSpan.style.left = "50%";
        startSpan.style.transform = "translate(-50%, -50%)";
        startSpan.appendChild(startText);

        document.getElementById(id.toString()).style.background = "green";
        document.getElementById(id.toString()).style.color = "white";
        document.getElementById(id.toString()).style.position = "relative";
        document.getElementById(id.toString()).appendChild(startSpan);

        startOrEnd = 2;
    } else {
        document.getElementById(prevEndPoint.toString()).innerHTML = "";
        document.getElementById(prevEndPoint.toString()).style.background = "grey";
        prevEndPoint = id;
        endPoint = id;

        let endText = document.createTextNode("E");
        let endSpan = document.createElement("span");
        endSpan.style.fontWeight = "bold";
        endSpan.style.padding = "0";
        endSpan.style.margin = "0";
        endSpan.style.position = "absolute";
        endSpan.style.fontSize = "24px";
        endSpan.style.top = "50%";
        endSpan.style.left = "50%";
        endSpan.style.transform = "translate(-50%, -50%)";
        endSpan.appendChild(endText);

        document.getElementById(id.toString()).style.background = "orange";
        document.getElementById(id.toString()).style.color = "white";
        document.getElementById(id.toString()).style.position = "relative";
        document.getElementById(id.toString()).appendChild(endSpan);


        startOrEnd = 1;
    }
}

//set / get number of rows and columns
function dimensions() {
    let rows = 0;
    let cols = 0;
    return {
        setDimensions(r, c) {
            rows = r;
            cols = c;
        },
        getDimensions() {
            return { rows: rows, cols: cols };
        }
    }
}
let rc = dimensions();

//generate a matrix of row * col dimension
function genGrid(e) {

    //remove prompt and append instructions
    document.getElementById("empty-message").innerHTML = "";
    document.getElementById("instructions").style.color = "black";
    let instructions = document.createTextNode("Great! Now click on any two points on the grid and make a path with the buttons below.");
    document.getElementById("instructions").innerHTML = "";
    document.getElementById("instructions").appendChild(instructions);

    //reset points
    startPoint = 0;
    endPoint = 0;
    prevStartPoint = 0;
    prevEndPoint = 0;
    startOrEnd = 1;

    //parse form and restrictions
    e.preventDefault();
    let grid = document.getElementById("theGrid");
    grid.innerHTML = "";
    rc.setDimensions(e.target["rows"].value, e.target["columns"].value);
    let rows = rc.getDimensions().rows;
    let cols = rc.getDimensions().cols;
    if (rows > 10 || cols > 20) {
        document.getElementById("instructions").innerHTML = "";
        document.getElementById("instructions").style.color = "red";
        let error = document.createTextNode("Woops! Max rows is 10 and max columns is 20.");
        document.getElementById("instructions").appendChild(error);
        return;
    }

    //append divs to the DOM
    let uid = 0;
    for (let i = 0; i < rows; i++) {

        //rows
        let theRow = document.createElement("div");
        theRow.id = "row" + i.toString();
        theRow.style.width = "100%";
        theRow.style.height = "50px";
        theRow.style.marginTop = "10px";
        grid.appendChild(theRow);

        //columns
        for (let j = 0; j < cols; j++) {
            let currentRow = document.getElementById("row" + i.toString());
            let theCol = document.createElement("div");
            theCol.id = uid.toString();
            theCol.style.display = "inline-block";
            theCol.style.width = "45px";
            theCol.style.height = "45px";
            theCol.style.background = "grey";
            theCol.style.marginLeft = "10px";
            theCol.setAttribute("coordinates", i.toString() + "," + j.toString());
            theCol.addEventListener("click", function () {
                setStartOrEnd(parseInt(theCol.id));
            });
            theCol.onmouseover = function () {
                theCol.style.transform = "scale(1.1)";
                theCol.style.filter = "brightness(75%)";
            };
            theCol.onmouseout = function () {
                theCol.style.transform = "scale(1)";
                theCol.style.filter = "brightness(100%)";
            };
            ++uid;
            currentRow.appendChild(theCol);
        }
    }
}

//brute force path find
function linearScanHelper() {
    let limits = rc.getDimensions().rows * rc.getDimensions().cols;
    for (let i = 0; i < limits; i++) {
        if (i != startPoint && i != endPoint) {
            document.getElementById(i.toString()).style.background = "grey";
        }
    }
    if (startPoint > endPoint) {
        let uid = startPoint - 1;
        let cell = document.getElementById(uid.toString());
        let run = setInterval(traverse, 50);
        function traverse() {
            if (uid === endPoint || uid < 0 || uid > limits) {
                clearInterval(run);
            } else {
                if (!cell) {
                    clearInterval(run);
                }
                cell.style.background = "red";
                uid--;
                cell = document.getElementById(uid.toString());
            }
        }
    } else {
        let uid = startPoint + 1;
        let cell = document.getElementById(uid.toString());
        let run = setInterval(traverse, 50);
        function traverse() {
            if (uid === endPoint || uid < 0 || uid > limits) {
                clearInterval(run);
            } else {
                if (!cell) {
                    clearInterval(run);
                }
                cell.style.background = "red";
                uid++;
                cell = document.getElementById(uid.toString());
            }
        }
    }
}

//brute force path find
function linearScan() {
    linearScanHelper();
}

//check if index is valid
function checkBounds(i, j) {
    return i < rc.getDimensions().rows && i >= 0 && j < rc.getDimensions().cols && j >= 0;
}

//make an graph from 2d array (adjacency list) - 4 connectivity
function convertToAdjacencyList(matrix) {
    let nodeMap = {};
    for (let i = 0; i < rc.getDimensions().rows; i++) {
        for (let j = 0; j < rc.getDimensions().cols; j++) {
            let neighborsList = [];

            //check up
            if (checkBounds(i - 1, j)) {
                neighborsList.push(matrix[i - 1][j]);
            }

            //check down
            if (checkBounds(i + 1, j)) {
                neighborsList.push(matrix[i + 1][j]);
            }

            //check left 
            if (checkBounds(i, j - 1)) {
                neighborsList.push(matrix[i][j - 1]);
            }

            //check right
            if (checkBounds(i, j + 1)) {
                neighborsList.push(matrix[i][j + 1]);
            }

            nodeMap[matrix[i][j]] = neighborsList;
        }
    }
    return nodeMap;
}

//make an graph from 2d array (adjacency list) - 8 connectivity
function convertToAdjacencyList8Directions(matrix) {
    let nodeMap = {};
    for (let i = 0; i < rc.getDimensions().rows; i++) {
        for (let j = 0; j < rc.getDimensions().cols; j++) {
            let neighborsList = [];

            //check up
            if (checkBounds(i - 1, j)) {
                neighborsList.push(matrix[i - 1][j]);
            }

            //check down
            if (checkBounds(i + 1, j)) {
                neighborsList.push(matrix[i + 1][j]);
            }

            //check left 
            if (checkBounds(i, j - 1)) {
                neighborsList.push(matrix[i][j - 1]);
            }

            //check right
            if (checkBounds(i, j + 1)) {
                neighborsList.push(matrix[i][j + 1]);
            }

            //check top left
            if (checkBounds(i - 1, j - 1)) {
                neighborsList.push(matrix[i - 1][j - 1]);
            }

            //check top right
            if (checkBounds(i - 1, j + 1)) {
                neighborsList.push(matrix[i - 1][j + 1]);
            }

            //check bottom left
            if (checkBounds(i + 1, j - 1)) {
                neighborsList.push(matrix[i + 1][j - 1]);
            }

            //check bottom right
            if (checkBounds(i + 1, j + 1)) {
                neighborsList.push(matrix[i + 1][j + 1]);
            }

            nodeMap[matrix[i][j]] = neighborsList;
        }
    }
    return nodeMap;
}

//perform a breadth first search on a graph
function breadthFirstSearchHelper(graph, start, end) {
    let queue = [];
    queue.push([start]);
    let visited = new Set();
    while (queue.length > 0) {
        let path = queue.shift();
        let vertex = path[path.length - 1];
        if (vertex === end) {
            return path;
        }
        else if (!visited.has(vertex)) {
            for (adj in graph[vertex]) {
                let newPath = Array.from(path);
                newPath.push(graph[vertex][adj]);
                queue.push(newPath);
            }
            visited.add(vertex);
        }
    }
}


//setup matrixes and trace BFS path for a 4 connectivity traversal
function breadthFirstSearch() {
    //init 2d array
    let matrix = [];
    let n = 0;
    for (let i = 0; i < rc.getDimensions().rows; i++) {
        matrix[i] = [];
        for (let j = 0; j < rc.getDimensions().cols; j++) {
            matrix[i][j] = n;
            n++;
        }
    }

    //get shortest path
    let adjacencyList = convertToAdjacencyList(matrix);
    let shortestPath = breadthFirstSearchHelper(adjacencyList, startPoint, endPoint);
    shortestPath.shift();
    shortestPath.pop();

    //clear any current paths
    let limits = rc.getDimensions().rows * rc.getDimensions().cols;
    for (let i = 0; i < limits; i++) {
        if (i != startPoint && i != endPoint) {
            document.getElementById(i.toString()).style.background = "grey";
        }
    }

    //highlight path
    let run = setInterval(traverse, 50);
    let i = 0;
    function traverse() {
        if (i === shortestPath.length) {
            clearInterval(run);
        }
        else {
            document.getElementById(shortestPath[i].toString()).style.background = "red";
            i++;
        }
    }
}

//setup matrixes and trace BFS path for a 8 connectivity traversal
function breadthFirstSearch8Directions() {
    //init 2d array
    let matrix = [];
    let n = 0;
    for (let i = 0; i < rc.getDimensions().rows; i++) {
        matrix[i] = [];
        for (let j = 0; j < rc.getDimensions().cols; j++) {
            matrix[i][j] = n;
            n++;
        }
    }

    //get shortest path
    let adjacencyList = convertToAdjacencyList8Directions(matrix);
    let shortestPath = breadthFirstSearchHelper(adjacencyList, startPoint, endPoint);
    shortestPath.shift();
    shortestPath.pop();

    //clear any current paths
    let limits = rc.getDimensions().rows * rc.getDimensions().cols;
    for (let i = 0; i < limits; i++) {
        if (i != startPoint && i != endPoint) {
            document.getElementById(i.toString()).style.background = "grey";
        }
    }

    //highlight path
    let run = setInterval(traverse, 50);
    let i = 0;
    function traverse() {
        if (i === shortestPath.length) {
            clearInterval(run);
        }
        else {
            document.getElementById(shortestPath[i].toString()).style.background = "red";
            i++;
        }
    }
}