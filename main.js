//Example fetch using pokemonapi.co
document.querySelector('button').addEventListener('click', getFetch)

function getFetch(){
  const choice = document.querySelector('input').value.replaceAll('.', '').replaceAll(' ', '-')
  console.log(choice)

  const url = `https://pokeapi.co/api/v2/pokemon/${choice.toLowerCase()}`

  fetch(url)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        console.log(data)
        //console.log(data.species.name,data.height,data.types,data.sprites.front_default)
        const potentialPet = new PokeInfo(data.species.name,data.height,data.weight,data.types,data.sprites.other["official-artwork"].front_default,data.location_area_encounters)
        
        potentialPet.getTypes()
        potentialPet.isItHousepet()

        let decision = ''
        if (potentialPet.housepet) {
          decision = `This Pokemon is small enough, light enough, and safe enough to be a good pet! You can find ${potentialPet.name} in the following location(s):`
          potentialPet.encounterInfo()
        } else {
          let reasonStr = potentialPet.reason.join(' and ')
          decision = `This Pokemon would not be a good pet because ${reasonStr}.`
          document.getElementById('locations').innerText  = ''
        }
        document.querySelector('h2').innerText = decision
        document.querySelector('img').src = potentialPet.image

      })
      .catch(err => {
          console.log(`error ${err}`)
          document.querySelector('h2').innerText = `Pokemon not found. Please try again.`
      });
}

class Poke {
  constructor (name, height, weight, types, image) {
    this.name = name
    this.height = height
    this.types = types
    this.typeList = []
    this.image = image
    this.weight = weight
    this.housepet = true
    this.reason = []
  }

  getTypes() {
    for (const property of this.types) {
      this.typeList.push(property.type.name)
    }
  }

  isItHousepet() {
    let badTypes = ['fire','electric','fighting','poison','psychic','ghost']
    if (this.weightToPounds(this.weight) > 400) {
      this.reason.push('it is too heavy')
      this.housepet = false
    } 
    if (this.heightToFeet(this.height) > 7) {
      this.reason.push('it is too tall')
      this.housepet = false
    } 
    if (badTypes.some(r=> this.typeList.indexOf(r) >= 0)) {
      this.reason.push('its type is too dangerous')
      this.housepet = false
    } 
  }

  weightToPounds (w) {
    return Math.round((w/4.536)*100)/100
  }

  heightToFeet (h) {
    return Math.round((h/3.048)*100)/100
  }
}

class PokeInfo extends Poke{
  constructor(name,height,weight,types,image,location){
    super(name,height,weight,types,image)
    this.locationURL = location
    this.locationList = []
    this.locationString = ''
  }

  encounterInfo(){
    fetch(this.locationURL)
    .then(res => res.json())
    .then(data => {
      console.log(data);
      for(const item of data){
        this.locationList.push(item.location_area.name)
      }
      let target = document.getElementById('locations')
      target.innerText = this.locationCleanup()
    })
    .catch(err => {
      console.log(`error ${err}`);
    });
  }

  locationCleanup(){
    const words = this.locationList.slice(0,5).join(', ').replaceAll('-',' ').split(' ')
    for(let i = 0; i > words.length; i++){
      words[i] = words[i][0].toUpperCase() + words[i].slice(1)
    }
    return words.join(' ');
  }

}