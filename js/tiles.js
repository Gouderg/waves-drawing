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
        for (const key in tiles) {
            let a = tiles[key].id;

            // UP.
            if (this.UPPER === tiles[key].DOWN) {this.neighbours["UPPER"].push(a);}

            // RIGHT.
            if (this.RIGHT === tiles[key].LEFT) {this.neighbours["RIGHT"].push(a);}

            // DOWN.
            if (this.DOWN === tiles[key].UPPER) {this.neighbours["DOWN"].push(a);}

            // LEFT.
            if (this.LEFT === tiles[key].RIGHT) {this.neighbours["LEFT"].push(a);}
        }
    }
}
  