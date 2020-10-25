import CULT from "./cult";

const demon_ranks = ["Lesser Demon", "Demon soldier", "Greater Demon", "Demon count", "Demon Lord", "Arch-demon", "Primordial Demon"];

class Demon {
    constructor() {
        this.rank = 1;
        this.power = 1000;
        this.power_cap = 1000;
        this.power_per_adept = 1;
        this.pps = 0;
        this.ppc = 1;

        document.getElementById('addpower').addEventListener('click', () => {
            this.power += this.ppc;
        });
    }

    rank_name() {
        switch(this.rank) {
            case 1:
                return "Lesser Demon";
            case 2:
                return "Demon soldier";
        }
    }

    render() {
        document.getElementById('drank').innerHTML = this.rank_name();
        document.getElementById('dpower').innerHTML = Math.round(this.power) + '/' + this.power_cap;
        document.getElementById('ppc').innerHTML = this.ppc;
        document.getElementById('pps').innerHTML = this.pps;
    }

    tick(delta) {
        this.pps = this.power_per_adept * CULT.members["adept"].total;
        this.power += this.pps*(delta);
    }
}

const DEMON = new Demon();
export default DEMON;