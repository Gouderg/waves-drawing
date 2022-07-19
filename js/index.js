'use strict';

const nbTiles = 20;
let grid = [];
var buttonDraw = document.getElementById('grid-button');
var tiles = [];

// Fetch data from json.
fetch("./json/constraint.json").then(response => {return response.json();})
                               .then(jsondata => getConstraint(jsondata))  ;

// Extract data from json.
function getConstraint(constraint) {
    
    // Create Array of objects with value.
    for (const elt in constraint){

        if (constraint[elt].is_rotated) {
            let ct = [constraint[elt].UPPER, constraint[elt].RIGHT, constraint[elt].DOWN, constraint[elt].LEFT];

            for (let i = 0; i < 4; i++) {
                let html = document.getElementById(elt+"_"+i.toString()).outerHTML
                let p = new Tiles(elt+"_"+i.toString(), ct[0], ct[1], ct[2], ct[3], html);
                tiles.push(p);
                let a = ct[3]
                for (let j = 3; j >= 0; j--) {
                    ct[j] = ct[j-1]
                }
                ct[0] = a
            }
        } else {
            let p = new Tiles(elt, constraint[elt].UPPER, constraint[elt].RIGHT, constraint[elt].DOWN, constraint[elt].LEFT, document.getElementById(elt).outerHTML);
            tiles.push(p);
        }
    }

    // Find neighbours.
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].findNeighbours(tiles);
    }

    // Init grid with tiles.
    initgrid();

}

// Init grid.
function initgrid() {
    for (let i = 0; i < nbTiles; i++) {
        let val = []
        for (let j = 0; j < nbTiles; j++) {
            let t = {
                'is_collapse': 1,
                'tiles': JSON.parse(JSON.stringify(tiles)),
                'entropy': tiles.length
            }

            val.push(t);
        }
        grid.push(val);
    }
    console.log(grid)
    drawgrid();
}


// Draw grid.
function drawgrid() {

    let grid_inner = "";
    for (let i = 0; i < nbTiles; i++) {
        let row = "<div class='row'>";
        for (let j = 0; j < nbTiles; j++) {

            // Superposition state.
            if (grid[i][j].is_collapse === 1) {
                row += "<div class='tile color'>"+grid[i][j].entropy+"</div>";
            } 
            
            // Valide state.
            else if (grid[i][j].is_collapse === 0) {
                row += grid[i][j].tiles[0].html;
            }
            
            // Forbidden state.
            else {
                row += "<div class='tile color-forbidden'>&nbsp;</div>";
            }
        }
        row += "</div>";
        grid_inner += row;
    }
    document.getElementById("grid").innerHTML = grid_inner;
}


// function run() {
//     let is_collapse = 1;
//     while (is_collapse) {
//         is_collapse = waveFunctionCollapsed();
//         drawgrid();
//         break;
//     }
// }

// function waveFunctionCollapsed() {
    
//     return 0;
// }


// Wait event.
buttonDraw.addEventListener('click', function(e){

});

function test() {
    let a = [1, 2, 3, 4];
    let b = JSON.parse(JSON.stringify(a));
    b[0] = 5;

    console.log(a, b);
    return 'Bite'
}