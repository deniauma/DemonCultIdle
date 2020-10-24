import DEMON from './demon.js'
import CULT from './cult.js'
import { createPopper } from '@popperjs/core'


class Ritual {
    static count = 0;
    constructor(name, power_cost, sacrifice_type, sacrifices, ritualists_req) {
        Ritual.count ++;
        this.id = Ritual.count;
        this.name = name;
        this.power_cost = power_cost;
        this.sacrifices = sacrifices;
        this.ritualists_req = ritualists_req;
        this.ritualists_alloc = 0;
        this.sacrifice_type = sacrifice_type;
        this.delay = 10000;

        this.generate_ui();
    }

    generate_ui() {
        let el = document.createElement('div');
        this.ui_container_id = 'rit'+ this.id;
        el.className = 'ritual flex upg';
        el.id = this.ui_container_id;
        el.innerHTML = `<div class="rit-name">`+ this.name +`</div>
                    <div class="alloc flex"><button id="rit`+ this.id +`-alloc-minus">-</button><div class="alloc-nb">`+ this.ritualists_alloc +`</div><button id="rit`+ this.id +`-alloc-plus">+</button></div>
                    <div class="btn-wrapper"><button id="rit`+ this.id +`-do">Perform</button></div>`;
        document.getElementById('rituals').appendChild(el);

        document.getElementById('rit'+ this.id +'-alloc-minus').addEventListener('click', () => {
            if(this.ritualists_alloc > 0) {
                CULT.dealloc_ritualist();
                this.ritualists_alloc -= 1;
                document.querySelector('#'+this.ui_container_id+' .alloc-nb').innerHTML = this.ritualists_alloc;
            }
        });
        document.getElementById('rit'+ this.id +'-alloc-plus').addEventListener('click', () => {
            if(CULT.is_ritualist_available()) {
                CULT.alloc_ritualist();
                this.ritualists_alloc += 1;
                document.querySelector('#'+this.ui_container_id+' .alloc-nb').innerHTML = this.ritualists_alloc;
            }
        });
        document.getElementById('rit'+ this.id +'-do').addEventListener('click', () => {
            this.effect();
        });
        document.querySelector('#'+this.ui_container_id+' .btn-wrapper').addEventListener('mouseenter', (event) => { //'#'+this.ui_container_id+' .btn-wrapper'
            // createPopper(event.target, document.getElementById('tooltip'));
            this.tooltip(true);
        });
        document.querySelector('#'+this.ui_container_id+' .btn-wrapper').addEventListener('mouseleave', (event) => {
            // createPopper(event.target, document.getElementById('tooltip'));
            this.tooltip(false);
        });
    }

    disable(bool) {
        document.getElementById('rit'+ this.id +'-do').disabled = bool;
    }

    is_ready() {
        return this.ritualists_alloc >= this.ritualists_req && DEMON.power >= this.power_cost  && CULT.are_members_availabled(this.sacrifice_type, this.sacrifices);
    }

    tooltip(bool) {
        if(bool) {
            let el = document.createElement("div");
            el.id = "tooltip";
            el.innerHTML = '<p>' + this.name + " requires:</p>"
                + '<ul><li>'+ this.ritualists_alloc +' / '+ this.ritualists_req +' ritualist(s)</li></ul>'
                + '<p>Cost:</p>'
                + '<ul><li>'+ DEMON.power + ' / ' +this.power_cost +' power</li>'
                + '<li>'+ CULT.members[this.sacrifice_type].total + ' / ' + this.sacrifices +' ' + this.sacrifice_type +'(s)</li></ul>';
            document.getElementById('game').append(el);
            createPopper(document.getElementById('rit'+ this.id +'-do'), document.getElementById('tooltip'), {
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

    render() {
        this.disable(!this.is_ready());
    }

    effect() {
        if(this.is_ready()) {
            DEMON.power -= this.power_cost;
            CULT.sacrifice(this.sacrifice_type, this.sacrifices);
            DEMON.power_cap += 10;
        }
    }
}


class SacrificeI extends Ritual {
    constructor() {
        super("Human sacrifice", 100, "candidate", 1, 5);
    }

}


class SacrificeII extends Ritual {
    constructor() {
        super("Adept sacrifice", 500, "adept", 1, 3);
    }

}


class Rituals {
    constructor() {
        this.allocated_ritualists = 0;
        this.max_ritualists = 0;
        this.rituals = [];
        this.rituals.push(new SacrificeI());
        this.rituals.push(new SacrificeII());
    }

    render() {
        this.rituals.forEach((rit) => {
            rit.render();
        });
    }
}

const RITUALS = new Rituals();
export default RITUALS;
