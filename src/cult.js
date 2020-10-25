import DEMON from './demon.js'
import { Automation } from './utils.js'
import { createPopper } from '@popperjs/core'

class Cultist {
    constructor(type, promote_from, base_cost, cost_mult) {
        this.base_cost = base_cost;
        this.cost_mult = cost_mult;
        this.level = 0;
        this.type = type;
        this.promote_from = promote_from;
        this.promoted = 0;
        this.sacrificed = 0;
        this.total = 0;
        this.automation = new Automation(1000);
        this.generate_ui();
    }

    generate_ui() {
        this.ui_button = 'upg-'+this.type;
        let html = document.createElement('div');
        html.id =  this.type;
        html.className = "flex upg";
        html.innerHTML = '<div class="upg-name">'+ this.type +'</div><div class="upg-lvl">'+ this.level + '</div><div class="btn-wrapper"><button id="' + this.ui_button + '"><span>Hire</span><br/><span class="upg-cost">'+this.base_cost +' power</span></button></div>';
        document.getElementById('upgrades').appendChild(html);
        document.querySelector('#'+this.type + ' > .btn-wrapper').addEventListener('mouseenter', () => {
            this.tooltip(true);
        });
        document.querySelector('#'+this.type + ' > .btn-wrapper').addEventListener('mouseleave', () => {
            this.tooltip(false);
        });
    }

    next_level_cost() {
        return Math.round((this.base_cost + this.level) * Math.pow(this.cost_mult, this.level));
    }

    level_up() {
        this.level++;
        this.update_pop();
        document.querySelector('#'+this.type+' .upg-cost').innerHTML = this.next_level_cost() + ' power';
    }

    update_pop() {
        this.total = this.level + this.automation.total - this.promoted - this.sacrificed;
        document.querySelector('#'+this.type+' > .upg-lvl').innerHTML = this.total;
    }

    onclick(func) {
        document.getElementById(this.ui_button).addEventListener('click', () => {
            func();
        });
    }

    disable(bool) {
        document.getElementById(this.ui_button).disabled = bool;
    }

    tooltip(bool) {
        if(bool) {
            let el = document.createElement("div");
            el.id = "tooltip";
            el.innerHTML = '<p>' + this.type + " requires:</p>";
            if(this.promote_from != "") {
                el.innerHTML += '<ul><li>1 '+ this.promote_from +'</li>'
                    + '<li>'+ this.next_level_cost() +' power</li></ul>';
            } else {
                el.innerHTML += '<ul><li>'+ this.next_level_cost() +' power</li></ul>';
            }
            document.getElementById('game').append(el);
            createPopper(document.getElementById(this.ui_button), document.getElementById('tooltip'), {
                placement: 'right',
                modifiers: [
                    {
                      name: 'offset',
                      options: {
                        offset: [0, 8],
                      },
                    },
                  ],
            });
        } else {
            document.getElementById('tooltip').remove();
        }
    }
}


class Candidate extends Cultist {
    constructor(base_cost) {
        super("candidate", "", base_cost);
        this.level = 100;
        this.dt = 30;
        this.delay = 1000;
        this.progress = 0;
        this.progress_tick = 100/(this.delay/this.dt);
        this.recruiting = false;
        this.recruit_nb = 1;
        this.automated = false;
    }

    generate_ui() {
        this.ui_button = 'upg-'+this.type;
        let html = document.createElement('div');
        html.id =  this.type;
        html.className = "flex upg";
        // html.innerHTML = '<div class="upg-name">'+ this.type +'</div><div class="upg-lvl">'+ this.level + '</div><button id="' + this.ui_button + '"><span>Recruit</span></button>';
        html.innerHTML = '<div class="upg-name">'+ this.type +'</div><div class="upg-lvl">'+ this.level + '</div><div id="' + this.ui_button + '" class="progress-bar"><div class="progress-curr" style="width: 30%"></div><span class="progress-text">Recruit<br/><span class="upg-cost">'+this.base_cost +' power</span></span></div>'
        document.getElementById('upgrades').appendChild(html);
    }

    level_up() {
        this.level += this.recruit_nb;
        document.querySelector('#'+this.type+' > .upg-lvl').innerHTML = this.level;
        this.delay += 1;
        this.progress_tick = 100/(this.delay/this.dt);
    }

    recruit_progress() {
        if(this.recruiting) {
            this.progress += this.progress_tick;
            if (this.progress > 100) {
                this.progress = 100;
            }
            
            if (this.progress == 100) {
                this.level_up();
                if(!this.automated) {
                    this.recruiting = false;    
                    this.disable(false);
                }
                this.progress = 0;
            }
            document.querySelector('.progress-curr').style.width = this.progress + '%';
        }
    }

    set_automation(bool) {
        this.automated = bool;
        if(bool) {
            this.recruiting = true;
        }
    }
}


class Cult {
    constructor() {
        this.demon = DEMON;//new Demon();
        this.members = {};
        this.members["candidate"] = new Cultist("candidate", "", 10, 1.10);
        // this.members["candidate"].level = 100;
        this.members["adept"] = new Cultist("adept", "candidate", 20, 1.20);
        this.members["recruiter"] = new Cultist("recruiter", "adept", 500, 1.20);
        this.members["ritualist"] = new Cultist("ritualist", "recruiter", 1000, 1.20);
        this.members["ritualist"].level = 10;
        this.allocated_ritualists = 0;

        this.members_onclick();
    }

    candidates() {
        return this.members["candidate"].total;
    }

    are_members_availabled(type, amount) {
        return this.members[type].total >= amount;
    }

    sacrifice(type, amount) {
        if(this.members[type].total >= amount) {
            this.members[type].sacrificed += amount;
        }
    }

    max_ritualists() {
        return this.members["ritualist"].level;
    }

    is_ritualist_available() {
        return this.max_ritualists() > this.allocated_ritualists;
    }

    alloc_ritualist() {
        this.allocated_ritualists += 1;
    }

    dealloc_ritualist() {
        this.allocated_ritualists -= 1;
    }

    members_onclick() {
        let candidates = this.members["candidate"];
        let adepts = this.members["adept"];
        let recruiters = this.members["recruiter"];
        let ritualists = this.members["ritualist"];
        candidates.onclick(() => {
            if(candidates.promote_from == "" && this.demon.power >= candidates.next_level_cost()) {
                this.demon.power -= candidates.next_level_cost();
                candidates.level_up();
            }
        });
        adepts.onclick(() => {
            if(this.demon.power >= adepts.next_level_cost() && this.members[adepts.promote_from].level >= 1) {
                this.demon.power -= adepts.next_level_cost();
                // this.members[adepts.promote_from].level -= 1;
                this.members[adepts.promote_from].promoted += 1;
                adepts.level_up();
                this.members[adepts.promote_from].update_pop();
            }
        });
        recruiters.onclick(() => {
            if(this.demon.power >= recruiters.next_level_cost() && this.members[recruiters.promote_from].level >= 1) {
                this.demon.power -= recruiters.next_level_cost();
                this.members[recruiters.promote_from].level -= 1;
                recruiters.level_up();
                this.members[recruiters.promote_from].update_pop();
            }
        });
        ritualists.onclick(() => {
            if(this.demon.power >= ritualists.next_level_cost() && this.members[ritualists.promote_from].level >= 1) {
                this.demon.power -= ritualists.next_level_cost();
                this.members[ritualists.promote_from].level -= 1;
                ritualists.level_up();
                this.members[ritualists.promote_from].update_pop();
            }
        });
    }

    render() {
        this.members["candidate"].disable(this.demon.power < this.members["candidate"].next_level_cost());
        this.members["adept"].disable(this.demon.power < this.members["adept"].next_level_cost() || this.members["candidate"].total == 0);
        this.members["recruiter"].disable(this.demon.power < this.members["recruiter"].next_level_cost() || this.members["adept"].total == 0);
        this.members["ritualist"].disable(this.demon.power < this.members["ritualist"].next_level_cost() || this.members["recruiter"].total == 0);
        this.members["candidate"].update_pop();
        this.members["adept"].update_pop();
        this.members["recruiter"].update_pop();
        this.members["ritualist"].update_pop();
        this.demon.render();

        document.getElementById('avail_rit').innerHTML = this.allocated_ritualists + ' / ' + this.max_ritualists();
    }

    tick(delta) {
        this.members["candidate"].automation.automated_amount = this.members["recruiter"].level;
        this.members["candidate"].automation.update();
        // this.members["candidate"].set_automation(this.members["recruiter"].level >= 1);
        // this.members["candidate"].recruit_progress();
        this.demon.pps = this.members["adept"].total;
        this.demon.tick(delta);
    }
}

const CULT = new Cult();
export default CULT;