var population;
var lifeP;
var count = 0;
var generation = 0;
var genP;
var rocketsP;
var target;
var colors;

const lifespan = 400;
const maxforce = 0.2;
const mutationrate = 0.01;
const startpopulation = 500;
const addpopulation = 100;
const maxpopulation = 500;
const changepop = false;

rx = 100;
ry = 150;
rw = 200;
rh = 10;

function setup() {
    createCanvas(400, 300);
    population = new Population(startpopulation);
    lifeP = createP();
    genP = createP();
    rocketsP = createP();
    target = createVector(width/2, 50);
}

function draw() {
    if (colors) {
        fill(colors.r, colors.b, colors.g, 150);
    } else {
        fill(255, 150);
    }
    background(0);
    population.run();
    lifeP.html(count);
    genP.html(generation);
    rocketsP.html(population.popsize);

    count++;
    if(count == lifespan) {
        if (changepop) {
            if (population.popsize < maxpopulation) {
                population.popsize += addpopulation;
            }
            population.fillemty();
        }
        population.evaluate();
        population.selection();
        population.randcolor();
        colors =  population.randcolor();
        generation++;
        count = 0;
    }
    
    noStroke();
    fill(255);
    rect(100, 150, 200, 10);

    ellipse(target.x, target.y, 16, 16);
}

function Population(popsize) {
    if (popsize) {
        this.popsize = popsize;
    } else {
        this.popsize = 25;
    }
    this.rockets = [];
    this.matingpool = [];

    for (var i = 0; i < this.popsize; i++) {
        this.rockets[i] = new Rocket();
    }

    this.evaluate = function() {
        var maxfit = 0;
        for (var i = 0; i < this.popsize; i++) {
            this.rockets[i].calcFitness();
            if (this.rockets[i].fitness > maxfit) {
                maxfit = this.rockets[i].fitness;
            }
        }

        for (var i = 0; i < this.popsize; i++) {
            this.rockets[i].fitness /= maxfit;
        }

        this.matingpool = [];
        for (var i = 0; i < this.popsize; i++) {
            var n = this.rockets[i].fitness * 100;
            for (var j = 0; j < n; j++) {
                this.matingpool.push(this.rockets[i]);
            }
        }
    }

    this.selection = function() {
        var newRockets = [];
        for (var i = 0; i < this.rockets.length; i++) {
            var parentA = random(this.matingpool).dna;
            var parentB = random(this.matingpool).dna;
            var child = parentA.crossover(parentB);
            child.mutation();
            newRockets[i] = new Rocket(child);
        }
        this.rockets = newRockets;
    }

    this.fillemty = function() {
        for (var i = 0; i < this.popsize; i++) {
            if (this.rockets[i] === undefined) {
                this.rockets[i] = new Rocket();
                console.log(i);
            }
        }
    }

    this.randcolor = function() {
        return {
            r: random(255),
            b: random(255),
            g: random(255)
        }
    }

    this.run = function() {
        for (var i = 0; i < this.popsize; i++) {
            this.rockets[i].update();
            this.rockets[i].show();
        }
    }
}

function DNA(genes) {
    if (genes) {
        this.genes = genes;
    } else {
        this.genes = [];
        for (var i = 0; i < lifespan; i++) {
            this.genes[i] = p5.Vector.random2D();
            this.genes[i].setMag(maxforce);
        }
    }

    this.crossover = function(partner) {
        var newgenes = [];
        var mid = floor(random(this.genes.length));
        for (var i = 0; i < this.genes.length; i++) {
            if (i > 0) {
                newgenes[i] = this.genes[i];
            } else {
                newgenes[i] = partner.genes[i];
            }
        }
        return new DNA(newgenes);
    }

    this.mutation = function() {
        for (var i = 0; i < this.genes.length; i++) {
            if (random(1) < mutationrate) {
                this.genes[i] = p5.Vector.random2D();
                this.genes[i].setMag(maxforce);
            }
        }
    }
}

function Rocket(dna) {
    this.pos = createVector(width/2, height);
    this.vel = createVector();
    this.acc = createVector();
    this.completed = false;
    this.crashed = false;
    if (dna) {
        this.dna = dna;
    } else {
        this.dna = new DNA();
    }
    this.fitness = 0;
    this.time = 1;

    this.applyForce = function(force) {
        this.acc.add(force);
    }

    this.calcFitness = function() {
        var d = dist(this.pos.x, this.pos.y, target.x, target.y);

        this.fitness = map(d, 0, width, width, 0);
        if (this.completed) {
            this.fitness *= 10;
        }
        if(this.crashed) {
            this.fitness /= 10;
        }
    }

    this.update = function() {

        var d = dist(this.pos.x, this.pos.y, target.x, target.y);
        if (d < 10) {
            this.completed = true;
            this.pos = target.copy();
        }

        if (this.pos.x > rx && this.pos.x < rx + rw && this.pos.y > ry && this.pos.y < ry + rh) {
            this.crashed = true;
        }

        if (this.pos.x > width || this.pos.x < 0) {
            this.crashed = true;
        }
        if (this.pos.y > height || this.pos.y < 0) {
            this.crashed = true;
        }

        this.applyForce(this.dna.genes[count])
        if (!this.completed && !this.crashed) {
            this.vel.add(this.acc);
            this.pos.add(this.vel);
            this.acc.mult(0);
            this.vel.limit(4);
        }
    }

    this.show = function() {
        push();
        noStroke();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        rectMode(CENTER);
        rect(0, 0, 25, 5);
        pop();
    }
}