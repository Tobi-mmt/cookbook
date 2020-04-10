export const recipes = [
  {
    meta: {
      portion: 4,
      duration: 20,
      category: 'Salat'
    },
    title: 'Kartoffelsalat',
    image: '/recipes/kartoffelsalat.jpg',
    description: [
      `Die Kartoffeln schälen und kochen, bis sie durch sind. In Scheiben schneiden und in eine Schüsel geben.
      Eine Tasse mit heißem Wasser füllen und 1 Brühwürfel
      darin auflösen. Diesen danach über die Kartoffeln schütten.
      Eine Zwiebel in kleine Würfel Schneiden und zusammen mit Salz, Pfeffer, Essig, Öl in die Schüssel geben und alles gut durchmischen.
      Nun wird so lange Wasser hinzugegeben, bis der Kartoffelsalat „nass“ aber NICHT suppenartig ist.`,
      'Schmeckt warm und kalt sehr gut.'],
    ingredients: [
      { name: 'Kartofflen, festkochend', quantity: '2 kg' },
      { name: 'Zwiebel', quantity: '1' },
      { name: 'Brühe', quantity: '1 Tasse' },
      { name: 'Salz', quantity: '' },
      { name: 'Pfeffer', quantity: '' },
      { name: 'Essig', quantity: '' },
      { name: 'Öl', quantity: '' },
      { name: 'Wasser', quantity: '' }

    ]

  },
  {
    meta: {
      portion: 4,
      duration: 15,
      category: 'Herzhaft'
    },
    title: 'Flammkuchen',
    image: '/recipes/flammkuchen.jpg',
    description: [
      'Backofen auf 250° vorheizen.',
      'Knetteig zubereiten und ganz dünn ausrollen.',
      `Schmand und Crème double mischen, würzen und dick auf dem Teig verstreichen.
      Zwiebeln mit ganz wenig Wasser 1 Minute bei 600 Watt in der Mikrowelle dünsten und zusammen mit dem Speck auf dem Belag verteilen.`,
      'Im Backofen auf einem Bleck (KEIN Gitter!) in der unteren Schiene 20 Minuten backen.',
      'Mit Schnittlauchröllchen bestreut servieren.'
    ],
    ingredients: [
      { section: 'Teig' },
      { quantity: '4 EL', name: 'Öl' },
      { quantity: '250 ml', name: 'Wasser' },
      { quantity: '2 Prisen', name: 'Salz' },
      { quantity: '500 g', name: 'Mehl' },
      { section: 'Belag' },
      { quantity: '4', name: 'Zwiebeln' },
      { quantity: '200 g', name: 'Speck, gewürfelt' },
      { quantity: '2 Becher', name: 'Crème double' },
      { quantity: '2 Becher', name: 'Schmand' },
      { quantity: '', name: 'Pfeffer' },
      { quantity: '', name: 'Salz' },
      { quantity: '', name: 'Schnittlauch' }
    ]
  },
  {
    meta: {
      portion: 2,
      duration: 30,
      category: 'Herzhaft'
    },
    title: 'Blätterteig mit Spinat & Feta',
    image: '/recipes/blaetterteig_mit_spinat.jpg',
    description: [
      'Den Ofen auf 175°C bei Umluft vorheizen.',
      `Öl im Topf erhitzen, die Zwiebel hinzugeben und glasig braten.
      Den aufgetauten rohen Spinat dazugeben und einige Momente lang dünsten. Sofern der Spinat zu viel Flüssigkeit ablässt, diese abgießen, den Käse und ein verquirltes Ei hinzufügen und alles gut vermischen.`,
      `Den Blätterteig ausrollen und in Quadrate schneiden, etwa 10
      x 10 cm groß. Mit der Spinatmischung befüllen, zu Dreiecken zusammenklappen, mit einem verquirlten Ei bestreichen und ab in den Ofen damit. Etwa 20 Minuten backen, bzw. bis die Dreiecke goldgelb sind.`
    ],
    ingredients: [
      { quantity: '1 Pck.', name: 'Blätterteig' },
      { quantity: '300 g', name: 'Spinat' },
      { quantity: '4 EL', name: 'Cheddarkäse, gerieben' },
      { quantity: '150 g', name: 'Feta-Käse' },
      { quantity: '1', name: 'Zwiebel' },
      { quantity: '2', name: 'Eier' },
      { quantity: '', name: 'Öl' }
    ]
  },
  {
    meta: {
      portion: 2,
      duration: 20,
      category: 'Herzhaft'
    },
    title: 'Thunfisch-Paprika-Sahne Nudelpfanne',
    image: '/recipes/thunfisch-paprika-pfanne.jpg',
    description: [
      'Die Nudeln in Salzwasser bissfest kochen.',
      `Paprikaschoten, Zwiebeln und Knoblauch würfeln. Die Paprikastücke in Öl anbraten und mit Salz und Pfeffer würzen. Danach in eine Schüssel geben. Jetzt die Zwiebeln und den Knoblauch in der selben Pfanne anbraten. Den Thunfisch mit dem Öl dazu geben und mit Salz, Pfeffer und Paprika würzen. Das Ganze ordentlich einköcheln lassen. Danach die Paprikastücke wieder dazu geben. Die Sahne angießen und etwas einkochen lassen. Die Sauce mit Salz, Pfeffer und Paprika abschmecken.
      Wer es gerne scharf mag, kann noch etwas Habaneropulver oder anderes Chilipulver dazu geben.`,
      'Vor dem Servieren die abgetropften Nudeln unterrühren.'
    ],
    ingredients: [
      { quantity: '300 g', name: 'Nudeln' },
      { quantity: '1', name: 'Zwiebel' },
      { quantity: '1', name: 'Knoblauchzehe' },
      { quantity: '400 ml', name: 'Sahne' },
      { quantity: '2 Dosen', name: 'hunfisch in Öl' },
      { quantity: '3', name: 'Paprikaschoten' },
      { quantity: '', name: 'Paprikapulver' },
      { quantity: '', name: 'Chilipulver' }
    ]
  },
  {
    meta: {
      portion: 2,
      duration: 40,
      category: 'Herzhaft'
    },
    title: 'Schweinemedaillons in Pfefferrahmsoße',
    image: '/recipes/schweinemedaillons.jpg',
    description: [
      'Buttergemüße in einen Topf geben und bei geringer Hitze auftauen.',
      `Filet waschen, trocken tupfen und in gleichmäßige Scheiben schneiden. Salzen, Pfeffern und mit dem Bacon umwickeln. In heißem Öl von allen Seiten anbraten.
      Brühe in heißes Wasser rühren und zum Fleisch geben, ebenso Cremefine, Frischkäse und Pfefferkörner und 7-8 min kochen lassen.`,
      'Dazu passen gut Nudeln oder Kroketten'
    ],
    ingredients: [
      { quantity: '350 g', name: 'Schweinefilet' },
      { quantity: '250 g', name: 'Buttergmüße' },
      { quantity: '1 Pck.', name: 'Speck' },
      { quantity: '100 ml', name: 'Brühe' },
      { quantity: '1/2 Flasche', name: 'Cremefine' },
      { quantity: '1 EL', name: 'Frischkäse' },
      { quantity: '1 TL', name: 'Pfefferkörner, eingelegt' },
      { quantity: '1 EL', name: 'Butter' }
    ]
  },
  {
    meta: {
      portion: '2-3',
      duration: 20,
      category: 'Herzhaft'
    },
    title: 'Tortellini alla panna',
    image: '/recipes/tortelini-sahne.jpg',
    description: [
      'Die Tortellinis nach Packungsanweisung kochen.',
      `Den gekochten Schinken in einer tiefen Pfanne mit Butter kurz anbraten, dann 400ml von der Sahne hineingeben und auf kleiner Stufe köcheln lassen.
      Wenn die Tortellini gar sind, in die Pfanne zur Schinkensahne geben und weiter köcheln lassen.`,
      'In der Zwischenzeit in einer kleinen Schüssel das Eigelb, den Parmesan, Muskatnuss, Salz und die restliche 200 ml Sahne verrühren, dann in die Pfanne zu den Tortellinis geben und so lange köcheln lassen, bis die Soße dickflüssig wird.',
      'Sofort servieren.'
    ],
    ingredients: [
      { quantity: '500 g', name: 'Tortellini, aus dem Frischeregal' },
      { quantity: '600 ml', name: 'Sahne' },
      { quantity: '200 g', name: 'Schinken' },
      { quantity: '2', name: 'Eigelb' },
      { quantity: '4 EL', name: 'Parmesan, frisch geriebener' },
      { quantity: '1 TL', name: 'Muskat' }
    ]
  },
  {
    meta: {
      portion: 5,
      duration: 30,
      category: 'Herzhaft'
    },
    title: 'Chili sin Carne',
    image: '/recipes/chilli-con-carne.jpg',
    description: [
      'Das Sojagranulat mit etwa 300 ml kochendem Wasser in einer Schüssel aufgießen und mit 1-2 TL Gemüsebrühepulver vermischen und ein paar Minuten einwirken lassen',
      'Die Zwiebeln und den Knoblauch würfeln und in heißem Öl 5 Minuten anschwitzen, bis sie weich sind. Gehackte Chilischoten mit Kernen, Kreuzkümmel und Chilipulver hinzufügen und weitere 2 Minuten dünsten. Das aufgewichte Sojagranulat in den Topf geben und bei großer Hitze ringsherum krümelig anbraten. Die Dosentomaten und die Zimtstange unterrühren und mit Salz und Pfeffer kräftig würzen.',
      'Alles auf mittlerer Flamme 90 Minuten köcheln lassen, dabei gelegentlich umrühren. 30 Minuten vor Ende der Garzeit die Bohnen hinzufügen und eventuell mit Sambal Oelek abschmecken (wem es noch nicht scharf genug sein sollte).',
      'Mit Weißbrot und einem Klecks Naturjoghurt oder Guacamole servieren.',
      'Noch besser schmeckt es, wenn man das Chili sin Carne schon am Vortag zubereitet.'
    ],
    ingredients: [
      { quantity: '300 g', name: 'Sojagranulat, fein' },
      { quantity: '2', name: 'Rote Chilischoten' },
      { quantity: '2 große', name: 'Zwiebeln' },
      { quantity: '1', name: 'Knoblauchzehe' },
      { quantity: '1 TL', name: 'Kreuzkümmel' },
      { quantity: '2 TL', name: 'Chilipulver' },
      { quantity: '3 Dosen', name: 'Tomaten, gestückelt' },
      { quantity: '2 Dosen', name: 'Kidneybohnen' },
      { quantity: '1', name: 'Zimtstange' },
      { quantity: '', name: 'Salz' },
      { quantity: '', name: 'Pfeffer' }
    ]
  },
  {
    meta: {
      portion: '7-10',
      duration: 20,
      category: 'Herzhaft'
    },
    title: 'Pizzabrötchen',
    image: '/recipes/pizzabroetchen.jpg',
    description: [
      'Bötchen in 2 Hälften zerschneiden.',
      'Schinken, Salamit und Paprika in kleine Quadrate schneiden.Alle Zutaten vermischen, mit Salz und Preffer abschmecken und auf den Brötchenhälften verteilen.',
      'Bei 180°C ca. 10 Minuten im Ofen auf mittlere Schiene backen.'
    ],
    ingredients: [
      { quantity: '200 g', name: 'Schinken' },
      { quantity: '200 g', name: 'Salami' },
      { quantity: '1 Glas', name: 'Champignons' },
      { quantity: '1', name: 'Paprika' },
      { quantity: '250 g', name: 'Gouda, gerieben' },
      { quantity: '1 Becher', name: 'Schmand' },
      { quantity: '1 Becher', name: 'saure Sahne Salz und Pfeffer' },
      { quantity: '10', name: 'Brötchen' }
    ]
  },
  {
    meta: {
      portion: 5,
      duration: 60,
      category: 'Herzhaft'
    },
    title: 'Linsen',
    image: '/recipes/linsen.jpg',
    description: [
      'Die Linsen 12 Stunden in kaltem Wasser einweichen lassen.',
      'Für die Soße die Zwiebeln und die Knoblauch in Margarine anbraten. Danach Mehl dazu geben, bis die Konsistenz breiig ist und eine goldgelbe Farbe angenommen hat. Mit Wasser ablöschen und mit einem Rührbesen gut verrühren. Danach Gemüsebrühe für 1 L Brühe hinzu geben (nur Pulver, ohne Wasser).',
      'Das Suppengrün am Stück hinzugeben und weich kochen lassen. Danach heraus sieben, im Mixer pürieren und iweder zurück in den Topf geben. Danach Balsamicoessig und Weinessig 50/50 mischen und mit Tomatenmark in die Soße geben.'
    ],
    ingredients: [
      { quantity: '500 g', name: 'Tellerlinsen' },
      { quantity: '2 große', name: 'Zwiebeln' },
      { quantity: '1 Zehe', name: 'Knoblauch' },
      { quantity: '1 EL', name: 'Mehl' },
      { quantity: '1,3 L', name: 'Wasser' },
      { quantity: 'für 1 L', name: 'Gemüsebrühe' },
      { quantity: '1 Bund', name: 'Suppengrün' },
      { quantity: '1 EL', name: 'Tomatenmark' },
      { quantity: 'je 1 Spritzer', name: 'Balsamiko & Weinessig' }
    ]
  },
  {
    meta: {
      portion: 5,
      duration: 40,
      category: 'Herzhaft'
    },
    title: 'Spätzle',
    image: '/recipes/spaetzle.jpg',
    description: [
      'Alle Zutaten in eine Schüssel geben und mit einem Kochlöffel kräftig rumrühren. Der Teig muss zäh werden. Mit Mehl und Wasser kann die Konsistenz angepasst werden.',
      'Für geschabte Spätzle etwas flüssiger, für gepresste etwas fester.',
      'Um die Spätzle zu schaben, verwendet man ein flaches Brett und einen Schaber, ähnlich einer Spachtel. Hat man dies nicht zu Hand genügt auch die Rückseite eines Messers. Die Rückseite muss allerdings eine gerade, glatte Kante haben.',
      'Einen Topf mit kochendem Wasser aufsetzen, etwas Salz hinein geben. Das Brett nass machen und etwas Teig auf dem Brett verteilen. Danach mit dem Schaber oder Messer über den Teig auf dem Brett ziehen, das alles flach verteilgt wird. Mit dem Messer etwa 5 cm von der Brettkant in richtung Kochtopf ansetzen und zügig in den Kochtopf schieben. Damit ist die erste Nudel gemacht. Dies einfach so lange wiederholen, bis der Teig verbaucht ist.',
      'Die Spätzle zwischendurch, etwa alle 5-10 Minuten, aus dem Wasser schöpfen und warm halten.'
    ],
    ingredients: [
      { quantity: '', name: '' }
    ]
  },
  {
    meta: {
      portion: 2,
      duration: 20,
      category: 'Herzhaft'
    },
    title: 'Pizzateig',
    image: '/recipes/pizzateig.jpg',
    description: [
      'Das Rezept ergibt Teig für 2 Pizzen.',
      'Das warme Wasser mit Salz und Hefe mischen. Dann 10 & des Mehls hinzugeben und verrühren. Den Rest des Mehls hinzugeben und mit Knethaken durchkneten.',
      'Den Teig mit einem feuchten Tuch abdecken und 2 Stunden beim Zimmertemperatur stehen lassen. Danach formst du den Teig in 2 Kugeln und lässt ihn weitere 6-8 Stunden ruhen.',
      'Danach übersteht der Teig bis zu 3 Tage, wenn er im Kühlschrank gelagert ist'
    ],
    ingredients: [
      { quantity: '200 ml', name: 'warmes Wasser' },
      { quantity: '360 g', name: 'Mehl (Typ 405)' },
      { quantity: '10 g', name: 'Salz' },
      { quantity: '3 g', name: 'Trockenhefe' }
    ]
  },
  {
    meta: {
      portion: 10,
      duration: 50,
      category: 'Süßspeise'
    },
    title: 'Kirschkuchen mit Streuseln',
    image: '/recipes/kirschkuchen.jpg',
    description: [
      'Mürbteig für den Boden',
      `Alles in eine Schüssel geben und gut rum rühren. Ist der Teig nicht mürbe genug noch etwas Mehl hinzu geben. Den Teig danach dünn ausrollen. Eine hohe Springform mit etwas Butter einfetten und den Teig vorsichtig hinein legen. Der
      Teig sollte bis an den Rand der Springform reichen.`,
      'Kirschbelag',
      'Die Gläser mit den Sauerkirschen durch einen Sieb leeren, den Saft der Gläser in einem Messbecher auffangen. Davon wird nur 0,5 Liter benötigt. Alles zusammen in einen Topf geben und erhitzen, dabei immer gut rumrühren. Ist der Saft heiß und leicht zähflüssig, sollte er für 10 Minuten auf einer kühlen Herdplatte stehen. Danach den Inhalt des Topfes gleichmäßig in der Springform verteilen.',
      'Streusel',
      'In einer Schüssel gut durchkneten, bis kleine Streusel entstehen. Diese dann über die Kirschmasse geben. Backen: bei 180°C Umluft ca 40 Minuten backen lassen. Danach abkühlen lassen, bevor die Sahne drauf kommt. Sahne Topping: 2 Becher Sahne steif schlagen und ein Esslöffel Zucker dazu geben. Die Sahne auf dem abgekühlten Kuchen verteilen und für die Optik mit einer Gabel ein Wellenmusterin die Sahne malen.'
    ],
    ingredients: [
      { section: 'Mürbteig' },
      { quantity: '250 g', name: 'Mehl' },
      { quantity: '50 g', name: 'Margarine' },
      { quantity: '80 g', name: 'Zucker' },
      { quantity: '1', name: 'Ei' },
      { quantity: '1 Schuss', name: 'Milch' },
      { quantity: '0,5 Pck.', name: 'Backpulver' },
      { section: 'Kirschbelag' },
      { quantity: '0,5 L', name: 'des Kirschsaftes' },
      { quantity: '3 EL', name: 'Zucker' },
      { quantity: '1 Pck.', name: 'Roter Tortenguss' },
      { quantity: 'abgetropfte', name: 'Kirschen' },
      { section: 'Streusel' },
      { quantity: '90 g', name: 'Mehl' },
      { quantity: '90 g', name: 'Butter' },
      { quantity: '90 g', name: 'geriebene Haselnüsse' },
      { quantity: '90 g', name: 'Zucker' },
      { quantity: 'etwas', name: 'Zimt' }
    ]
  },
  {
    meta: {
      portion: 2,
      duration: 20,
      category: 'Süßspeise'
    },
    title: 'Pfannkuchen',
    image: '/recipes/pfannkuchen.jpg',
    description: [
      'Das Mehl, die Milch, die Eier und die Prise Salz mit dem Handrührgerät zu einem glatten Teig verrühren, bis dieser leichte Blasen wirft. Dann den Teig für ca. eine halbe Stunde im Kühlschrank ruhen lassen.',
      'Den Teig aus dem Kühlschrank nehmen, noch einen guten Schuss Mineralwasser hinzufügen und das Ganze nochmals kurz durchrühren.',
      'Die Pfannenkuchen in einer beschichtetetn Pfanne mit etwas Butter heraus braten, bis sie goldgelb sind.'
    ],
    ingredients: [
      { quantity: '400 g', name: 'Mehl' },
      { quantity: '750 ml', name: 'Milch' },
      { quantity: '1 Prise', name: 'Salz' },
      { quantity: '3', name: 'Eier' },
      { quantity: '1 Schuss', name: 'Mineralwasser' }
    ]
  },
  {
    meta: {
      portion: 3,
      duration: 120,
      category: 'Süßspeise'
    },
    title: 'Dampfnudeln',
    image: '/recipes/dampfnudeln.jpg',
    description: [
      `Aus Mehl, Butter, Eiern, lauwarmer Milch, Salz und aufgelöster Hefe einen Teig rühren. Dabei so lange schlagen, bis er Blaßen wirft. Teig an einen warmen Ort bringen und mit einem Küchentuch abdecken und dort gehen lassen.
      Danach den Teig in kleine Kugeln formen und wieder etwas gehen lassen.`,
      'In eine Pfanne eine Tasse Milch, 50 g Butter (wahlweiße mit etwas Wasser vermischen) und eine Prise Salz geben. Das Ganze etwas aufwärmen, bis die Butter verlaufen ist. Nun die Teiglinge dicht an dicht in der Pfanne platzieren und mit einem Deckel verschließen. Das Ganze nun bei mittlerer Temperatur kochen lassen, bis die Milch vollständig verkocht ist.'
    ],
    ingredients: [
      { quantity: '500 g', name: 'Mehl' },
      { quantity: '100 g', name: 'Butter' },
      { quantity: '200 ml', name: 'Milch' },
      { quantity: '2', name: 'Eier' },
      { quantity: '1 Priese', name: 'Salz' },
      { quantity: '20 g', name: 'Hefe' }
    ]
  },
  {
    meta: {
      portion: 10,
      duration: 30,
      category: 'Süßspeise'
    },
    title: 'Rhabarberkuchen',
    image: '/recipes/rhabarberkuchen.jpg',
    description: [
      'Den Rhabarber scälen und in Stäcke scheniden. Mit etwa 4 Esslöffel Zucker vermischen und einziehen lassen.',
      'Die Backform mit etwas Butter einfetten.',
      'Die Zutaten des Teiges in eine Schüssel geben und kräftig durchkneten. Den Teig ausrollen und in die Form geben.',
      'Den Boden mit Zimt bestreuen und die Semmelbrösel verteilen.',
      'Die Zutaten - außer die Schlagsahne - vom Guss in einer Schüssel anrühren. Die Schlagsahne steif schlagen und ebenfalls in die Schüssel geben.',
      'Danach den gezuckerten Rhabarber in die Form mit dem Teig geben und den Guss darüber geben. Etwas Zimt darüber streuen.',
      'Den Kuchen nun auf der 2. Schiene von unten etwa 60 Minuten lang bei 160° C Umluft backen lassen.'
    ],
    ingredients: [
      { section: 'Teig' },
      { quantity: '300 g', name: 'Mehl' },
      { quantity: '0,5 Pck.', name: 'Backpulver' },
      { quantity: '80 g', name: 'Zucker' },
      { quantity: '1', name: 'Ei' },
      { quantity: '50 g', name: 'Margarine' },
      { quantity: 'Hand voll', name: 'Semmebrösel' },
      { quantity: '1 Spritzer', name: 'Milch' },
      { quantity: 'etwas', name: 'Zimt' },
      { section: 'Guss' },
      { quantity: '1 kg', name: 'Rhabarber' },
      { quantity: '1 EL', name: 'Mehl' },
      { quantity: '3', name: 'Eier' },
      { quantity: '1 Pck.', name: 'Vanille-Zucker' },
      { quantity: '2 Becher', name: 'Schmand' },
      { quantity: '1 Becher', name: 'Schlagsahne' },
      { quantity: '150 g', name: 'Zucker' }
    ]
  }
]
