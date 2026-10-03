/* BERTH.A · Premiações · Asset Manifest v173
   Fonte única de verdade para a próxima biblioteca visual.
   NÃO altera os assets atuais no app até que o lote visual correspondente seja enviado.
*/
window.BERTHA_PREMIACOES_ASSETS_V174 = Object.freeze({
  version: '174',
  visualStyle: 'soft-3d-pastel-collectible',
  genderDirection: 'unisex',
  colorRule: 'pastel-balanced-no-pink-dominance',
  collections: {
    ocean: {
      label: 'Oceano',
      capsule: 'capsule_ocean',
      pets: [
        ['ocean_turtle_cute','Tartaruga'],
        ['ocean_shark_cute','Tubarão'],
        ['ocean_jellyfish_cute','Água-viva'],
        ['ocean_octopus_cute','Polvo'],
        ['ocean_whale_cute','Baleia'],
        ['ocean_clownfish_cute','Peixe-palhaço']
      ],
      accessories: [
        ['ocean_acc_cap','Boné náutico','head'],
        ['ocean_acc_collar','Coleira/concha','neck'],
        ['ocean_acc_glasses','Óculos de mergulho','face'],
        ['ocean_acc_backpack','Mochila oceano','body'],
        ['ocean_acc_snorkel','Snorkel','face'],
        ['ocean_acc_special','Concha especial / medalha oceano','special'],
        ['ocean_acc_bubble','Bolha de ar','special']
      ]
    },
    space: {
      label: 'Espaço', capsule: 'capsule_space',
      pets: [
        ['space_cat_cute','Gato espacial'],['space_alien_cute','Alien'],['space_robot_cute','Robô'],
        ['space_astronaut_cute','Astronauta'],['space_planet_cute','Planetinha'],['space_shooting_star_cute','Estrela cadente']
      ],
      accessories: [
        ['space_acc_helmet','Capacete/visor','head'],['space_acc_collar','Coleira estelar','neck'],
        ['space_acc_glasses','Óculos futuristas','face'],['space_acc_backpack','Mochila espacial','body'],
        ['space_acc_badge','Insígnia galáctica','medallion'],['space_acc_special','Item especial cósmico','special'],
        ['space_acc_spaceship','Espaçonave','special']
      ]
    },
    forest: {
      label: 'Floresta', capsule: 'capsule_forest',
      pets: [
        ['forest_fox_cute','Raposa'],['forest_wolf_cute','Lobo'],['forest_tiger_cute','Tigre'],
        ['forest_faun_cute','Fauno'],['forest_bird_cute','Ave'],['forest_capybara_cute','Capivara']
      ],
      accessories: [
        ['forest_acc_hat','Chapéu/folha','head'],['forest_acc_collar','Coleira natureza','neck'],
        ['forest_acc_glasses','Óculos camp','face'],['forest_acc_backpack','Mochila floresta','body'],
        ['forest_acc_badge','Medalha botânica','medallion'],['forest_acc_special','Item especial floresta','special'],
        ['forest_acc_binoculars','Binóculo','special']
      ]
    },
    solar: {
      label: 'Solar', capsule: 'capsule_solar',
      pets: [
        ['solar_lion_cute','Leão'],['solar_phoenix_cute','Fênix'],['solar_dragon_cute','Dragão solar'],
        ['solar_lizard_cute','Lagarto'],['solar_mystic_cute','Criatura mística brilhante'],['solar_bee_cute','Abelha']
      ],
      accessories: [
        ['solar_acc_crown','Coroa/tiara solar','head'],['solar_acc_collar','Coleira brilho','neck'],
        ['solar_acc_glasses','Óculos solares','face'],['solar_acc_backpack','Mochila solar','body'],
        ['solar_acc_badge','Medalha sol','medallion'],['solar_acc_special','Item especial radiante','special'],
        ['solar_acc_parasol','Guarda-sol','special']
      ]
    },
    coral: {
      label: 'Coral', capsule: 'capsule_coral',
      pets: [
        ['coral_axolotl_cute','Axolote'],['coral_octopus_cute','Polvo coral'],['coral_seahorse_cute','Cavalo-marinho'],
        ['coral_starfish_cute','Estrela-do-mar'],['coral_shrimp_cute','Camarão'],['coral_ray_cute','Arraia']
      ],
      accessories: [
        ['coral_acc_algae_tiara','Tiara algas','head'],['coral_acc_collar','Coleira pérola','neck'],
        ['coral_acc_glasses','Óculos coral','face'],['coral_acc_backpack','Mochila coral','body'],
        ['coral_acc_badge','Medalha concha','medallion'],['coral_acc_special','Item especial recife','special'],
        ['coral_acc_beach_toys','Brinquedos de praia','special']
      ]
    },
    mist: {
      label: 'Névoa / Mist', capsule: 'capsule_mist',
      pets: [
        ['mist_cat_cute','Gato'],['mist_fox_cute','Raposa'],['mist_rabbit_cute','Coelho']
      ],
      accessories: [
        ['mist_acc_cap','Cabeça','head'],['mist_acc_collar','Pescoço','neck'],['mist_acc_glasses','Rosto','face'],
        ['mist_acc_backpack','Corpo/costas','body'],['mist_acc_badge','Medalhão','medallion'],['mist_acc_special','Especial','special']
      ]
    }
  },
  progression: ['bronze','silver','gold','trophy','super_trophy','capsule'],
  accessoriesWearable: true,
  accessoryUnlockRule: { medalsPerAccessory: 3, accessoriesToCompletePet: 5 },
  accessoryColors: ['blue','mint','lavender','coral','vanilla','soft-gold'],
  ownerPins: ['constancy','cycle','focus','balance','goal','presence','sequence','delivery','continuity','selfcare','depth','evolution'],
  recognitions: ['thanks','flower','coffee','moment','reward','saved','hug','kiss','rocked']
});
