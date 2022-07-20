'use strict';

const nbTiles = 3;
const coef = 1000;
var grid = [];
var buttonDraw = document.getElementById('button-draw');
var buttonReset = document.getElementById('button-reset');
var buttonNext = document.getElementById('button-next');

var tiles = {};
var idtiles = [];

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
                tiles[elt+"_"+i.toString()] = p;
                let a = ct[3]
                for (let j = 3; j >= 0; j--) {
                    ct[j] = ct[j-1]
                }
                ct[0] = a
            }
        } else {
            let p = new Tiles(elt, constraint[elt].UPPER, constraint[elt].RIGHT, constraint[elt].DOWN, constraint[elt].LEFT, document.getElementById(elt).outerHTML);
            tiles[elt] = p;
        }
    }

    // Find neighbours.
    for (const key in tiles) {
        tiles[key].findNeighbours(tiles);
    }

    // Get id from all tiles.
    for (const key in tiles) {
        let cp = tiles[key].id
        idtiles.push(cp);
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
                'tiles': JSON.parse(JSON.stringify(idtiles)),
                'entropy': idtiles.length
            }

            val.push(t);
        }
        grid.push(val);
    }

    drawgrid();
    waveFunctionCollapsed();
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
                console.log(i, j,   grid[i][j])
                row += tiles[grid[i][j].tiles].html;
            }
            
            // Forbidden state.
            else {
                console.log(grid[i][j].is_collapse)
                row += "<div class='tile color-forbidden'>&nbsp;</div>";
            }
        }
        row += "</div>";
        grid_inner += row;
    }
    document.getElementById("grid").innerHTML = grid_inner;
}


function run() {
    let is_collapse = 1;
    while (is_collapse) {
        is_collapse = waveFunctionCollapsed();
        // drawgrid();
    }
}

function waveFunctionCollapsed() {

    // Choose lowest entropy.
    let lowest = 100000;
    let pos = [];
    for (let i = 0; i < nbTiles; i++) {
        for (let j = 0; j < nbTiles; j++) {
            if (grid[i][j].is_collapse === 1) {
                if (grid[i][j].entropy < lowest) {
                    lowest = grid[i][j].entropy;
                    pos = [[i, j]];
    
                } else if (grid[i][j].entropy === lowest) {
                    pos.push([i, j]);
                }
            }
        }
    }

    // If all tiles is stable
    if (lowest === 100000 && pos.length === 0) return 0;

    // If lowest entropy is not alone.
    if (pos.length > 1) {
        pos = pos[Math.floor(Math.random() * pos.length)];
    } else {
        pos = pos[0];
    }
    let i = pos[0];
    let j = pos[1];
    
    // Now we have the position of the lowest entropy, we need to choose the value.
    grid[i][j].tiles = grid[i][j].tiles[Math.floor(Math.random() * grid[i][j].tiles.length)];
    grid[i][j].is_collapse = 0;
    
    // Propagation loop.
    let fifo = [];
    let already_visited = [i * coef + j];

    // Up.
    if (i - 1 >= 0 && grid[i-1][j].is_collapse === 1) {
        fifo.push((i-1) * coef + j);
        grid[i-1][j].tiles = JSON.parse(JSON.stringify(tiles[grid[i][j].tiles].neighbours.UPPER));
    }

    // Right.
    if (j + 1 < nbTiles && grid[i][j+1].is_collapse === 1) {
        fifo.push(i * coef + j + 1);
        grid[i][j+1].tiles = JSON.parse(JSON.stringify(tiles[grid[i][j].tiles].neighbours.RIGHT));
    }
    
    // Down.
    if (i + 1 < nbTiles && grid[i+1][j].is_collapse === 1) {
        fifo.push((i + 1) * coef + j);
        grid[i+1][j].tiles = JSON.parse(JSON.stringify(tiles[grid[i][j].tiles].neighbours.DOWN));
    }

    // Left.
    if (j - 1 >= 0 && grid[i][j-1].is_collapse === 1) {
        fifo.push(i * coef + (j-1));
        grid[i][j-1].tiles = JSON.parse(JSON.stringify(tiles[grid[i][j].tiles].neighbours.LEFT));
    }

    updateEntropy();

    while (fifo.length > 0) {
        let pos_raw = fifo.shift();
        let pos_i = Math.floor(pos_raw/coef);
        let pos_j = pos_raw % coef;

        already_visited.push(pos_raw);
        if (already_visited.length > nbTiles) break;
        console.log(pos_raw, already_visited, !already_visited.includes((pos_i - 1) * coef + pos_j), !already_visited.includes(pos_i * coef + pos_j + 1), !already_visited.includes((pos_i + 1) * coef + pos_j), !already_visited.includes(pos_i * coef + pos_j - 1))

        // Look if coordinate are valide.
        if (pos_i < 0 || pos_i >= nbTiles || pos_j < 0 || pos_j >= nbTiles || grid[pos_i][pos_j].is_collapse < 1) continue;

        // For each direction, find all neighbours of all case (intersection and it in )
        // UP.
        if (pos_i - 1 >= 0 && !already_visited.includes((pos_i - 1) * coef + pos_j) && grid[pos_i-1][pos_j].is_collapse === 1) {
            let is_pos = []
            for (const key in grid[pos_i][pos_j].tiles) {
                is_pos = is_pos.concat(tiles[grid[pos_i][pos_j].tiles[key]].neighbours.UPPER);
            }
            // Remove all duplicates.
            is_pos = is_pos.filter((v, i, a) => a.indexOf(v) === i);

            // Intersection between values.
            console.log(grid[pos_i-1][pos_j].tiles, pos_i-1, pos_j, grid[pos_i-1][pos_j])
            grid[pos_i-1][pos_j].tiles = grid[pos_i-1][pos_j].tiles.filter(value => is_pos.includes(value));

            if (!fifo.includes((pos_i-1) * coef + pos_j)) {
                fifo.push((i-1) * coef + j);
            }
            
        }

        // Right.
        if (pos_j + 1 < nbTiles && !already_visited.includes(pos_i * coef + pos_j + 1) && grid[pos_i][pos_j+1].is_collapse === 1) {
            let is_pos = []
            for (const key in grid[pos_i][pos_j].tiles) {
                is_pos = is_pos.concat(tiles[grid[pos_i][pos_j].tiles[key]].neighbours.RIGHT);
            }
            // Remove all duplicates.
            is_pos = is_pos.filter((v, i, a) => a.indexOf(v) === i);

            // Intersection between values.
            console.log(grid[pos_i][pos_j+1].tiles, pos_i, pos_j+1, grid[pos_i][pos_j+1])

            grid[pos_i][pos_j+1].tiles = grid[pos_i][pos_j+1].tiles.filter(value => is_pos.includes(value));


            if (!fifo.includes(pos_i * coef + (pos_j+1))) {
                fifo.push(pos_i * coef + (pos_j+1))
            }
        }

        // Down.
        if (pos_i + 1 < nbTiles && !already_visited.includes((pos_i + 1) * coef + pos_j) && grid[pos_i+1][pos_j].is_collapse === 1) {
            let is_pos = []
            for (const key in grid[pos_i][pos_j].tiles) {
                is_pos = is_pos.concat(tiles[grid[pos_i][pos_j].tiles[key]].neighbours.UPPER);
            }
            // Remove all duplicates.
            is_pos = is_pos.filter((v, i, a) => a.indexOf(v) === i);

            // Intersection between values.
            console.log(grid[pos_i+1][pos_j].tiles, pos_i+1, pos_j, grid[pos_i+1][pos_j])

            grid[pos_i+1][pos_j].tiles = grid[pos_i+1][pos_j].tiles.filter(value => is_pos.includes(value));

            if (!fifo.includes((pos_i+1) * coef + pos_j)) {
                fifo.push((i+1) * coef + j);
            }
        }

        // Left.
        if (pos_j - 1 >= 0 && !already_visited.includes(pos_i * coef + pos_j - 1) && grid[pos_i][pos_j-1].is_collapse === 1) {
            let is_pos = []
            for (const key in grid[pos_i][pos_j].tiles) {
                is_pos = is_pos.concat(tiles[grid[pos_i][pos_j].tiles[key]].neighbours.RIGHT);
            }
            // Remove all duplicates.
            is_pos = is_pos.filter((v, i, a) => a.indexOf(v) === i);

            // Intersection between values.
            console.log(grid[pos_i][pos_j-1].tiles, pos_i, pos_j-1, grid[pos_i][pos_j-1])

            grid[pos_i][pos_j-1].tiles = grid[pos_i][pos_j-1].tiles.filter(value => is_pos.includes(value));


            if (!fifo.includes(pos_i * coef + (pos_j-1))) {
                fifo.push(pos_i * coef + (pos_j-1))
            }
        }

        // drawgrid();
        
    }
    updateEntropy();    
    for (let i = 0; i < nbTiles; i++) {
        for (let j = 0; j < nbTiles; j++) {
            if (grid[i][j].entropy === 1) {
                grid[i][j].tiles = grid[i][j].tiles[0]
                grid[i][j].is_collapse = 0;
            } else if (grid[i][j].entropy === 0) {
                grid[i][j].is_collapse = -1;
            }
        }
    }
    console.log(grid)
    // updateEntropy();    
    drawgrid();
    return 1;
}

function updateEntropy() {
    // Update entropy.
    for (let i = 0; i < nbTiles; i++) {
        for (let j = 0; j < nbTiles; j++) {
            if (grid[i][j].is_collapse === 1) {
                grid[i][j].entropy = grid[i][j].tiles.length
            }
        }
    }
}


// Wait event.
buttonDraw.addEventListener('click', (e) => {
    run()
});

buttonNext.addEventListener('click', (e) => {
    waveFunctionCollapsed();
});

buttonReset.addEventListener('click', (e) => {
    window.location.reload();
});