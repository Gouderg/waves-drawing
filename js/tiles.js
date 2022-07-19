'use strict';

class Tiles {
    constructor(id, upper, right, down, left, html) {
        this.id = id;
        this.UPPER = upper;
        this.RIGHT = right;
        this.DOWN = down;
        this.LEFT = left;

        this.is_collapsed = false;
        this.neighbours = {
            "UPPER": [],
            "RIGHT": [],
            "DOWN": [],
            "LEFT": []
        };

        this.html = html;
    }

    findNeighbours (tiles) {
        for (let j = 0; j < tiles.length; j++) {
            if (tiles[j].id !== this.id) {

                // UP.
                if (this.UPPER === tiles[j].DOWN) {this.neighbours["UPPER"].push(tiles[j].id);}

                // RIGHT.
                if (this.RIGHT === tiles[j].LEFT) {this.neighbours["RIGHT"].push(tiles[j].id);}

                // DOWN.
                if (this.DOWN === tiles[j].UPPER) {this.neighbours["DOWN"].push(tiles[j].id);}

                // LEFT.
                if (this.LEFT === tiles[j].RIGHT) {this.neighbours["LEFT"].push(tiles[j].id);}

            }
        }
    }
  }
  