'use strict';

const nbTiles = 20;
let grid = [];


function initgrid() {
    for (let i = 0; i < nbTiles; i++) {
        let val = []
        for (let j = 0; j < nbTiles; j++) {
            val.push(i+j);
        }
        grid.push(val);
    }

    drawgrid()
}



function drawgrid() {
    let grid_inner = "";
    for (let i = 0; i < nbTiles; i++) {
        let row = "<div class='row'>"
        for (let j = 0; j < nbTiles; j++) {
            if (grid[i][j] % 2) {
                row += "<div class='tile color2'>&nbsp;</div>"
            } else {
                row += "<div class='tile color1'>&nbsp;</div>"
            }
        }
        row += "</div>"
        grid_inner += row
    }

    document.getElementById("grid").innerHTML = grid_inner
}