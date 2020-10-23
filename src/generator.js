import { Resource } from './utils.js'


export class Generator {
    constructor(name, init_cost, cost_pow) {
        this.name = name;
        this.ups = 1; //units pers sec
        this.base_cost = init_cost;
        this.cost_pow = cost_pow;
        this.level = 0;
        this.nb = 0;
        this.generate_ui();
    }

    next_level_cost() {
        return Math.round(this.base_cost * Math.pow(this.cost_pow, this.level));
    }

    level_up() {
        this.level++;
        this.nb ++;
        document.querySelector('#'+this.name.toLowerCase()+' > .upg-lvl').innerHTML = this.nb;
        document.querySelector('#'+this.name.toLowerCase()+' .upg-cost').innerHTML = this.next_level_cost() + ' power';
    }

    update_pop() {
        document.querySelector('#'+this.name.toLowerCase()+' > .upg-lvl').innerHTML = this.nb;
    }

    generate_ui() {
        this.ui_button = 'upg-'+this.name.toLowerCase();
        let html = document.createElement('div');
        html.id =  this.name.toLowerCase();
        html.className = "flex upg";
        html.innerHTML = '<div>'+ this.name +'</div><div class="upg-lvl">'+ this.nb + '</div><button id="' + this.ui_button + '"><span>Hire</span><br/><span class="upg-cost">'+this.next_level_cost() +' power</span></button>';
        document.getElementById('upgrades').appendChild(html);
    }

    onclick(func) {
        document.getElementById(this.ui_button).addEventListener('click', () => {
            func();
        });
    }

    disable(bool) {
        document.getElementById(this.ui_button).disabled = bool;
    }
}


export class Producer extends Generator {
    constructor(name, init_cost, cost_pow, generator) {
        super(name, init_cost, cost_pow);
        this.generator = generator;
    }

    level_up() {
        super.level_up();
        this.generator.nb ++;
    }

    produce(delta) {
        this.generator.nb += Math.floor(this.ups*delta);
    }
}

export class Cultist {
    constructor(type, promote_from, base_cost) {
        this.base_cost = base_cost;
        this.level = 0;
        this.type = type;
        this.promote_from = promote_from;
        this.generate_ui();
    }

    generate_ui() {
        this.ui_button = 'upg-'+this.type;
        let html = document.createElement('div');
        html.id =  this.type;
        html.className = "flex upg";
        html.innerHTML = '<div>'+ this.type +'</div><div class="upg-lvl">'+ this.level + '</div><button id="' + this.ui_button + '"><span>Hire</span><br/><span class="upg-cost">'+this.base_cost +' power</span></button>';
        document.getElementById('upgrades').appendChild(html);
    }

    level_up() {
        this.level++;
        document.querySelector('#'+this.type+' > .upg-lvl').innerHTML = this.level;
        document.querySelector('#'+this.type+' .upg-cost').innerHTML = this.base_cost + ' power';
    }

    update_pop() {
        document.querySelector('#'+this.type+' > .upg-lvl').innerHTML = this.level;
    }

    onclick(func) {
        document.getElementById(this.ui_button).addEventListener('click', () => {
            func();
        });
    }

    disable(bool) {
        document.getElementById(this.ui_button).disabled = bool;
    }
}

export class Cult {
    constructor() {
        this.candidates = 0;
        this.power = 1000;
        this.pps = 0; //power per sec
        this.members = [Cultist];
        this.members["adept"] = new Cultist("adept", "candidate", 10, 1.10);
        this.members["recruiter"] = new Cultist("recruiter", "adept", 50, 1.20);
        this.members["ritualist"] = new Cultist("ritualist", "recruiter", 100, 1.30);

        document.getElementById('recruit').addEventListener('click', () => {
            this.candidates += 1;
        });

        this.members["adept"].onclick(() => {
            if(this.power >= this.members["adept"].base_cost && this.candidates >= 1) {
                this.power -= this.members["adept"].base_cost;
                this.candidates -= 1;
                this.members["adept"].level_up();
            }
        });

        this.members["recruiter"].onclick(() => {
            if(this.power >= this.members["recruiter"].base_cost && this.members["adept"].level >= 1) {
                this.power -= this.members["recruiter"].base_cost;
                this.members["adept"].level -= 1;
                this.members["recruiter"].level_up();
                this.members["adept"].update_pop();
            }
        });

        this.members["ritualist"].onclick(() => {
            if(this.power >= this.members["ritualist"].base_cost && this.members["recruiter"].level >= 1) {
                this.power -= this.members["ritualist"].base_cost;
                this.members["recruiter"].level -= 1;
                this.members["ritualist"].level_up();
                this.members["recruiter"].update_pop();
            }
        });
    }

    update_pps() {
        this.pps = this.members["adept"].level;
    }

    render() {
        document.getElementById('power').innerHTML = Math.round(this.power);
        document.getElementById('pps').innerHTML = ' ('+this.pps+')';
        document.getElementById('members').innerHTML = Math.round(this.candidates);
    }

    tick(delta) {
        this.update_pps();
        this.power += this.pps*(delta);
        this.candidates += this.members["recruiter"].level*delta;
    }
}