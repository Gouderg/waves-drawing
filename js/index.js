'use strict';

// HTML DOM.
var buttonDraw = document.getElementById('button-draw');
var buttonReset = document.getElementById('button-reset');
var buttonNext = document.getElementById('button-next');
var buttonPrev = document.getElementById('button-prev');
var error = document.getElementById('error');
var slider = document.getElementById('slider');
var radios = document.querySelectorAll('input[type=radio][name="constraint-radio"]');

// Constantes.
const nbTiles = 50;
const coef = 1000;
var millisecTime = slider.value;
var idInter;
var isRun = 1;

// Variables.
var grid = [];
var tiles = {};
var idtiles = [];
var historique = [];

// Fetch data from json.
fetch("./json/"+document.querySelector('input[name="constraint-radio"]:checked').id+".json")
    .then(response => response.json())
    .then(jsondata => getConstraint(jsondata))
    .catch(err => error.innerHTML = "Impossible de charger le fichier des contraintes");

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
}


// Draw grid.
function drawgrid() {

    let grid_inner = "";
    for (let i = 0; i < nbTiles; i++) {
        let row = "<div class='row'>";
        for (let j = 0; j < nbTiles; j++) {

            // Superposition state.
            if (grid[i][j].is_collapse === 1) {
                row += "<div class='tile color'>"+grid[i][j].entropy.toFixed(1)+"</div>";
            } 
            
            // Valide state.
            else if (grid[i][j].is_collapse === 0) {
                row += tiles[grid[i][j].tiles].html;
            }

            else if (grid[i][j].is_collapse === -2) {
                row += '<div class="form-container"><div class="shape cross"></div></div>'
            }
            // Forbidden state.
            else {
                row += '<div class="form-container"><div class="shape color-forbidden"></div></div>';
            }
        }
        row += "</div>";
        grid_inner += row;
    }
    document.getElementById("grid").innerHTML = grid_inner;
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
    
    // If all tiles is stable.
    if (lowest === 100000 && pos.length === 0) return 0;
    
    // If lowest entropy is not alone.
    pos = (pos.length > 1) ? pos[Math.floor(Math.random() * pos.length)] : pos[0];

    let i = pos[0];
    let j = pos[1];

    // Now we have the position of the lowest entropy, we need to choose the value.
    grid[i][j].tiles = grid[i][j].tiles[Math.floor(Math.random() * grid[i][j].tiles.length)];
    grid[i][j].is_collapse = 0;
    grid[i][j].entropy = 1;
    
    // Add the tile to the historique.
    historique.push([i,j]);
    
    // Run propagation on all collapsed tiles.
    propagation(i, j);

    // Update collapse.
    for (let i = 0; i < nbTiles; i++) {
        for (let j = 0; j < nbTiles; j++) {
            if (grid[i][j].entropy === 1 && Array.isArray(grid[i][j].tiles)) {
                if (isValid(i, j)) {
                    grid[i][j].tiles = grid[i][j].tiles[0]
                    grid[i][j].is_collapse = 0;
                } else {
                    grid[i][j].entropy = 0; 
                    grid[i][j].is_collapse = -2;
                }
            } else if (grid[i][j].entropy === 0 && grid[i][j].is_collapse === 1) {
                grid[i][j].is_collapse = -1;
            }
        }
    }
    
    drawgrid();
    return 1;
}


// Check if tiles around are collapsed and the value match.
function isValid(i, j) {

    // Up.
    if (i - 1 >= 0 && grid[i-1][j].is_collapse === 0 && tiles[grid[i][j].tiles[0]].UPPER !== tiles[grid[i-1][j].tiles].DOWN) {
        return 0;
    }
    // Right.
    if (j + 1 < nbTiles && grid[i][j+1].is_collapse === 0 && tiles[grid[i][j].tiles[0]].RIGHT !== tiles[grid[i][j+1].tiles].LEFT) {
        return 0;
    } 
    // Down.
    if (i + 1 < nbTiles && grid[i+1][j].is_collapse === 0 && tiles[grid[i][j].tiles[0]].DOWN !== tiles[grid[i+1][j].tiles].UPPER) {
        return 0;
    }
    // Left.
    if (j - 1 >= 0 && grid[i][j-1].is_collapse === 0 && tiles[grid[i][j].tiles[0]].LEFT !== tiles[grid[i][j-1].tiles].RIGHT) {
        return 0;
    }

    return 1;
}

// Update entropy.  
function updateEntropy() {
    for (let i = 0; i < nbTiles; i++) {
        for (let j = 0; j < nbTiles; j++) {
            if (grid[i][j].is_collapse === 1) {
                grid[i][j].entropy = grid[i][j].tiles.length;
            }
        }
    }
}

// Propagation function.
function propagation(i, j) {
    let fifo = [];
    let already_visited = [i * coef + j];
    
    // Up.
    if (i - 1 >= 0 && grid[i-1][j].is_collapse === 1) {
        fifo.push((i-1) * coef + j);
        let cp = JSON.parse(JSON.stringify(tiles[grid[i][j].tiles].neighbours.UPPER));
        grid[i-1][j].tiles = grid[i-1][j].tiles.filter(value => cp.includes(value));
    }
    
    // Right.
    if (j + 1 < nbTiles && grid[i][j+1].is_collapse === 1) {
        fifo.push(i * coef + j + 1);
        let cp = JSON.parse(JSON.stringify(tiles[grid[i][j].tiles].neighbours.RIGHT));
        grid[i][j+1].tiles = grid[i][j+1].tiles.filter(value => cp.includes(value));
    }
    
    // Down.
    if (i + 1 < nbTiles && grid[i+1][j].is_collapse === 1) {
        fifo.push((i + 1) * coef + j);
        let cp = JSON.parse(JSON.stringify(tiles[grid[i][j].tiles].neighbours.DOWN));
        grid[i+1][j].tiles = grid[i+1][j].tiles.filter(value => cp.includes(value))
    }
    
    // Left.
    if (j - 1 >= 0 && grid[i][j-1].is_collapse === 1) {
        fifo.push(i * coef + (j-1));
        let cp = JSON.parse(JSON.stringify(tiles[grid[i][j].tiles].neighbours.LEFT));
        grid[i][j-1].tiles = grid[i][j-1].tiles.filter(value => cp.includes(value))
    }
    
    
    while (fifo.length > 0) {
        let pos_raw = fifo.shift();
        let pos_i = Math.floor(pos_raw/coef);
        let pos_j = pos_raw % coef;
        
        already_visited.push(pos_raw);
        
        // Look if coordinate are valide.
        if (pos_i < 0 || pos_i >= nbTiles || pos_j < 0 || pos_j >= nbTiles || grid[pos_i][pos_j].is_collapse < 1 || grid[pos_i][pos_j].tiles.length === 0) continue;
        
        // For each direction, find all neighbours of all case.
        // UP - Valid coordinate, not visited and not collapse.
        if (pos_i - 1 >= 0 && !already_visited.includes((pos_i - 1) * coef + pos_j) && grid[pos_i-1][pos_j].is_collapse === 1) {
            let is_pos = []
            for (const key in grid[pos_i][pos_j].tiles) {
                is_pos = is_pos.concat(tiles[grid[pos_i][pos_j].tiles[key]].neighbours.UPPER);
            }
            // Remove all duplicates.
            is_pos = is_pos.filter((v, i, a) => a.indexOf(v) === i);
            
            // Intersection between values.
            grid[pos_i-1][pos_j].tiles = grid[pos_i-1][pos_j].tiles.filter(value => is_pos.includes(value));

            if (!fifo.includes((pos_i-1) * coef + pos_j)) {
                fifo.push((pos_i-1) * coef + pos_j);
            }
            
        }
        
        // Right.
        if (pos_j + 1 < nbTiles && !already_visited.includes(pos_i * coef + (pos_j + 1)) && grid[pos_i][pos_j+1].is_collapse === 1) {
            let is_pos = []
            for (const key in grid[pos_i][pos_j].tiles) {
                is_pos = is_pos.concat(tiles[grid[pos_i][pos_j].tiles[key]].neighbours.RIGHT);
            }
            // Remove all duplicates.
            is_pos = is_pos.filter((v, i, a) => a.indexOf(v) === i);
            
            // Intersection between values.
            grid[pos_i][pos_j+1].tiles = grid[pos_i][pos_j+1].tiles.filter(value => is_pos.includes(value));
            
            
            if (!fifo.includes(pos_i * coef + (pos_j+1))) {
                fifo.push(pos_i * coef + (pos_j+1))
            }
        }
        
        // Down.
        if (pos_i + 1 < nbTiles && !already_visited.includes((pos_i + 1) * coef + pos_j) && grid[pos_i+1][pos_j].is_collapse === 1) {
            let is_pos = []
            for (const key in grid[pos_i][pos_j].tiles) {
                is_pos = is_pos.concat(tiles[grid[pos_i][pos_j].tiles[key]].neighbours.DOWN);
            }
            // Remove all duplicates.
            is_pos = is_pos.filter((v, i, a) => a.indexOf(v) === i);
            
            // Intersection between values.
            grid[pos_i+1][pos_j].tiles = grid[pos_i+1][pos_j].tiles.filter(value => is_pos.includes(value));
            
            if (!fifo.includes((pos_i+1) * coef + pos_j)) {
                fifo.push((pos_i+1) * coef + pos_j);
            }
        }
        
        // Left.
        if (pos_j - 1 >= 0 && !already_visited.includes(pos_i * coef + pos_j - 1) && grid[pos_i][pos_j-1].is_collapse === 1) {
            let is_pos = []
            for (const key in grid[pos_i][pos_j].tiles) {
                is_pos = is_pos.concat(tiles[grid[pos_i][pos_j].tiles[key]].neighbours.LEFT);
            }
            // Remove all duplicates.
            is_pos = is_pos.filter((v, i, a) => a.indexOf(v) === i);
            
            // Intersection between values.
            grid[pos_i][pos_j-1].tiles = grid[pos_i][pos_j-1].tiles.filter(value => is_pos.includes(value));
            
            if (!fifo.includes(pos_i * coef + (pos_j-1))) {
                fifo.push(pos_i * coef + (pos_j-1))
            }
        }
        
    }
    updateEntropy();    
}

function prev() {

    // If no move was played.
    if (historique.length === 0) return;

    // Remove last plqy from historique.
    let last_pos = historique.pop()
    
    // Say isn't collapse.
    grid[last_pos[0]][last_pos[1]].is_collapse = 1;

    // Restore all entropy and possibilities.
    for (let i = 0; i < nbTiles; i ++) {
        for (let j = 0; j < nbTiles; j ++) {
            if (grid[i][j].is_collapse === 1) {
                grid[i][j].tiles = JSON.parse(JSON.stringify(idtiles));
                grid[i][j].entropy = idtiles.length;
            }
        }
    }

    // Run propagation on all collapsed tiles.
    if (historique.length > 0 ) {
        for (let k = historique.length - 1; k >= 0 ; k -= 1) {
            propagation(historique[k][0], historique[k][1]);
        }
    } else {
        grid = []
        initgrid();
    }

    drawgrid();
}

function run() {

    idInter = setInterval( () => {
        // Update.
        isRun = waveFunctionCollapsed();

        // Clear Interval if grid is collapse.
        if (isRun === 0) {
            clearInterval(idInter);
        }
    }, millisecTime);

}


// Wait event.
buttonDraw.addEventListener('click', (e) => {
    run();
});

buttonPrev.addEventListener('click', (e) => {
    prev();
});

buttonNext.addEventListener('click', (e) => {
    waveFunctionCollapsed();
});

buttonReset.addEventListener('click', (e) => {
    window.location.reload();
});

slider.addEventListener('change', (e) => {
    millisecTime = slider.value;
    clearInterval(idInter);
    run();
});

Array.prototype.forEach.call(radios, function(radio) {
   radio.addEventListener('change', () => {
        window.location.reload();
   });
});