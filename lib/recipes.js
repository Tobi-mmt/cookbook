export const recipes = [
  {
    meta: {
      portion: 6,
      duration: 20,
      category: 'Salat'
    },
    title: 'Kartoffelsalat',
    image: '/recipes/kartoffelsalat.jpg',
    description: [
      'Die Kartoffeln schälen und kochen, bis sie durch sind.',
      'Kartoffeln in Scheiben schneiden und in eine Schüsel geben.',
      'Eine Tasse mit heißem Wasser füllen und 1 Brühwürfel darin auflösen. Diesen danach über die Kartoffeln schütten.',
      `Eine Zwiebel in kleine Würfel schneiden und zusammen mit Salz, Pfeffer, Essig, Öl in die Schüssel geben und alles gut durchmischen.
      Nun wird so lange Wasser hinzugegeben, bis der Kartoffelsalat „nass“ aber NICHT suppenartig ist.`,
      'Den fertigen Salat warm servieren – schmeckt auch kalt sehr gut.'],
    ingredients: [
      { name: 'Kartoffeln, festkochend', quantity: 2, unit: 'kg' },
      { name: 'Zwiebel', quantity: 1 },
      { name: 'Brühe', quantity: 1, unit: 'Tasse' },
      { name: 'Salz' },
      { name: 'Pfeffer' },
      { name: 'Essig' },
      { name: 'Öl' },
      { name: 'Wasser' }

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
      'Alle Zutaten für den Teig in eine Schüssel geben und gut durchkneten.',
      'Den Teig ganz dünn ausrollen.',
      'Schmand und Crème double mischen, würzen und dick auf dem Teig verstreichen.',
      'Zwiebeln schneiden und bei geringer Hitze in der Pfanne dünsten und zusammen mit dem Speck auf dem Belag verteilen.',
      'Im Backofen auf einem Bleck (KEIN Gitter!) in der unteren Schiene 20 Minuten backen.',
      'Mit Schnittlauchröllchen bestreut servieren.'
    ],
    ingredients: [
      { section: 'Teig' },
      { quantity: 4, unit: 'EL', name: 'Öl' },
      { quantity: 250, unit: 'ml', name: 'Wasser' },
      { quantity: 2, unit: 'Prisen', name: 'Salz' },
      { quantity: 500, unit: 'g', name: 'Mehl' },
      { section: 'Belag' },
      { quantity: 4, name: 'Zwiebeln' },
      { quantity: 200, unit: 'g', name: 'Speck, gewürfelt' },
      { quantity: 2, unit: 'Becher', name: 'Crème double' },
      { quantity: 2, unit: 'Becher', name: 'Schmand' },
      { name: 'Pfeffer' },
      { name: 'Salz' },
      { name: 'Schnittlauch' }
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
      'Öl im Topf erhitzen, die Zwiebel hinzugeben und glasig braten.',
      'Spinat dazugeben und einige Momente lang dünsten. Sofern der Spinat zu viel Flüssigkeit ablässt, diese abgießen.',
      'Käse und ein verquirltes Ei hinzufügen und alles gut vermischen.',
      'Den Blätterteig ausrollen und in Quadrate schneiden, etwa 10 x 10 cm groß.',
      'Spinatmischung auf die Quadrate geben, zu Dreiecken zusammenklappen, mit einem verquirlten Ei bestreichen und ab in den Ofen.',
      'Etwa 20 Minuten backen, bzw. bis die Dreiecke goldgelb sind.'
    ],
    ingredients: [
      { quantity: 1, unit: 'Pck.', name: 'Blätterteig' },
      { quantity: 300, unit: 'g', name: 'Spinat' },
      { quantity: 4, unit: 'EL', name: 'Cheddarkäse, gerieben' },
      { quantity: 150, unit: 'g', name: 'Feta-Käse' },
      { quantity: 1, name: 'Zwiebel' },
      { quantity: 2, name: 'Eier' },
      { name: 'Öl' }
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
      'Paprikaschoten, Zwiebeln und Knoblauch würfeln.',
      'Zwiebeln und Knoblauch in Öl anbraten und mit Salz und Pfeffer würzen.',
      'Thunfisch mit dem Öl dazu geben und ein paar Minuten köcheln lassen.',
      'Danach die Paprikastücke mit der Sahne dazu geben und etwas einkochen lassen.',
      'Die Sauce mit Salz, Pfeffer und Paprika abschmecken. Wer es gerne scharf mag, kann noch etwas Chilipulver dazu geben.',
      'Vor dem Servieren die abgetropften Nudeln unterrühren.'
    ],
    ingredients: [
      { quantity: 300, unit: 'g', name: 'Nudeln' },
      { quantity: 1, name: 'Zwiebel' },
      { quantity: 1, name: 'Knoblauchzehe' },
      { quantity: 400, unit: 'ml', name: 'Sahne' },
      { quantity: 2, unit: 'Dosen', name: 'Thunfisch in Öl' },
      { quantity: 3, name: 'Paprikaschoten' },
      { name: 'Paprikapulver' },
      { name: 'Chilipulver' }
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
      'Buttergemüße in einen Topf geben und bei geringer Hitze auftauen lassen.',
      'Filet waschen, trocken tupfen und in gleichmäßige Scheiben schneiden, mit Salz und Pfeffer würzen und mit Bacon umwickeln.',
      'Filet in einer Pfanne mit heißem Öl von allen Seiten scharf anbraten, so dass das Fleisch medium wird.',
      'Gemüsebrühpulver in heißes Wasser rühren und zum Fleisch geben, zusammen mit Cremefine, Frischkäse und Pfefferkörner.',
      'Nach etwa 7 Minuten einkochen ist alles fertig.',
      'Dazu passen gut Nudeln oder Kroketten'
    ],
    ingredients: [
      { quantity: 350, unit: 'g', name: 'Schweinefilet' },
      { quantity: 250, unit: 'g', name: 'Buttergmüße' },
      { quantity: 1, unit: 'Pck.', name: 'Speck' },
      { quantity: 100, unit: 'ml', name: 'Brühe' },
      { quantity: 0.5, unit: 'Flasche', name: 'Cremefine' },
      { quantity: 1, unit: 'EL', name: 'Frischkäse' },
      { quantity: 1, unit: 'TL', name: 'Pfefferkörner, eingelegt' },
      { quantity: 1, unit: 'EL', name: 'Butter' }
    ]
  },
  {
    meta: {
      portion: 3,
      duration: 20,
      category: 'Herzhaft'
    },
    title: 'Tortellini alla panna',
    image: '/recipes/tortelini-sahne.jpg',
    description: [
      'Die Tortellinis nach Packungsanweisung kochen.',
      'Den gekochten Schinken in einer tiefen Pfanne mit Butter kurz anbraten',
      '2/3 der Sahne hineingeben und auf kleiner Stufe köcheln lassen.',
      'Wenn die Tortellini gar sind, in die Pfanne zur Schinkensahne geben und weiter köcheln lassen.',
      'In der Zwischenzeit in einer kleinen Schüssel das Eigelb, den Parmesan, Muskatnuss, Salz und die restliche Sahne verrühren und in die Pfanne geben',
      'Köcheln lassen, bis die Soße dickflüssig wird.',
      'Sofort servieren.'
    ],
    ingredients: [
      { quantity: 500, unit: 'g', name: 'Tortellini, aus dem Frischeregal' },
      { quantity: 600, unit: 'ml', name: 'Sahne' },
      { quantity: 200, unit: 'g', name: 'Schinken' },
      { quantity: 2, name: 'Eigelb' },
      { quantity: 4, unit: 'EL', name: 'Parmesan, frisch geriebener' },
      { quantity: 1, unit: 'TL', name: 'Muskat' }
    ]
  },
  {
    meta: {
      portion: 5,
      duration: 100,
      category: 'Herzhaft'
    },
    title: 'Chili con Soja',
    image: '/recipes/chilli-con-carne.jpg',
    description: [
      'Sojagranulat mit kochendem Wasser im Verhältins 1:1 in einer Schüssel aufgießen und mit 1-2 TL Gemüsebrühepulver vermischen. Ein paar Minuten einwirken lassen',
      'Zwiebeln und Knoblauch würfeln und in heißem Öl kurz anschwitzen, bis sie weich sind. Gehackte Chilischoten mit Kernen, Kreuzkümmel und Chilipulver hinzufügen und weitere 2 Minuten dünsten.',
      'Das aufgewichte Sojagranulat in den Topf geben und bei großer Hitze ringsherum krümelig anbraten.',
      'Die Dosentomaten und die Zimtstange unterrühren und mit Salz und Pfeffer kräftig würzen.',
      'Alles bei geringer Hitze etwa 60 Minuten köcheln lassen, dabei gelegentlich umrühren.',
      'Bohnen hinzufügen und weiter 30 Minuten köcheln lassen.',
      'Mit Weißbrot und einem Klecks Naturjoghurt oder Guacamole servieren.',
      'Noch besser schmeckt es, wenn man das Chili con Soja schon am Vortag zubereitet.'
    ],
    ingredients: [
      { quantity: 300, unit: 'g', name: 'Sojagranulat, fein' },
      { quantity: 2, name: 'Rote Chilischoten' },
      { quantity: 2, unit: 'große', name: 'Zwiebeln' },
      { quantity: 1, name: 'Knoblauchzehe' },
      { quantity: 1, unit: 'TL', name: 'Kreuzkümmel' },
      { quantity: 2, unit: 'TL', name: 'Chilipulver' },
      { quantity: 3, unit: 'Dosen', name: 'Tomaten, gestückelt' },
      { quantity: 2, unit: 'Dosen', name: 'Kidneybohnen' },
      { quantity: 1, name: 'Zimtstange' },
      { name: 'Salz' },
      { name: 'Pfeffer' }
    ]
  },
  {
    meta: {
      portion: 8,
      duration: 20,
      category: 'Herzhaft'
    },
    title: 'Pizzabrötchen',
    image: '/recipes/pizzabroetchen.png',
    description: [
      'Bötchen in 2 Hälften zerschneiden.',
      'Schinken, Salamit und Paprika in kleine Quadrate schneiden.',
      'Alle Zutaten vermischen, mit Salz und Preffer abschmecken und dick auf den Brötchenhälften verteilen.',
      'Bei 180°C ca. 10 Minuten im Ofen auf mittlere Schiene backen.'
    ],
    ingredients: [
      { quantity: 200, unit: 'g', name: 'Schinken' },
      { quantity: 200, unit: 'g', name: 'Salami' },
      { quantity: 1, unit: 'Glas', name: 'Champignons' },
      { quantity: 1, name: 'Paprika' },
      { quantity: 250, unit: 'g', name: 'Gouda, gerieben' },
      { quantity: 1, unit: 'Becher', name: 'Schmand' },
      { quantity: 1, unit: 'Becher', name: 'saure Sahne' },
      { quantity: 10, name: 'Brötchen' },
      { name: ' Salz' },
      { name: 'Pfeffer' }
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
      'Zwiebeln und die Knoblauch in Margarine anbraten.',
      'Mehl hinzu geben, bis die Konsistenz breiig ist und eine goldgelbe Farbe angenommen hat.',
      'Mit Wasser ablöschen und mit einem Rührbesen gut verrühren.',
      'Gemüsebrühe für 1 L Brühe hinzu geben (nur Pulver, ohne Wasser).',
      'Suppengrün am Stück hinzugeben und etwa 30 Minuten weich kochen lassen.',
      'Suppengrün heraussieben, im Mixer pürieren und wieder zurück in den Topf geben.',
      'Balsamicoessig und Weinessig 50/50 mischen und mit Tomatenmark in die Soße geben.',
      'Zusammen mit Spätzle servieren'
    ],
    ingredients: [
      { quantity: 500, unit: 'g', name: 'Tellerlinsen' },
      { quantity: 2, unit: 'große', name: 'Zwiebeln' },
      { quantity: 1, unit: 'Zehe', name: 'Knoblauch' },
      { quantity: 1, unit: 'EL', name: 'Mehl' },
      { quantity: 1.3, unit: 'L', name: 'Wasser' },
      { quantity: 1, unit: 'EL', name: 'Gemüsebrühepulver' },
      { quantity: 1, unit: 'Bund', name: 'Suppengrün' },
      { quantity: 1, unit: 'EL', name: 'Tomatenmark' },
      { quantity: 1, unit: 'Spritzer', name: 'Balsamiko & Weinessig' }
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
      'Alle Zutaten in eine Schüssel geben und mit einem Kochlöffel kräftig rumrühren. Der Teig muss zäh werden. Mit Mehl und Wasser kann die Konsistenz angepasst werden. Für geschabte Spätzle etwas flüssiger, für gepresste etwas fester.',
      'Um die Spätzle zu schaben, verwendet man ein flaches Brett und einen Schaber, ähnlich einer Spachtel. Hat man dies nicht zu Hand genügt auch die Rückseite eines Messers. Die Rückseite muss allerdings eine gerade, glatte Kante haben.',
      'Einen Topf mit kochendem Wasser aufsetzen, etwas Salz hinein geben. Das Brett nass machen und etwas Teig auf dem Brett verteilen. Danach mit dem Schaber oder Messer über den Teig auf dem Brett ziehen, das alles flach verteilgt wird. Mit dem Messer etwa 5 cm von der Brettkant in richtung Kochtopf ansetzen und zügig in den Kochtopf schieben. Damit ist die erste Nudel gemacht. Dies einfach so lange wiederholen, bis der Teig verbaucht ist.',
      'Die Spätzle zwischendurch, etwa alle 5-10 Minuten, aus dem Wasser schöpfen und warm halten.'
    ],
    ingredients: [
      { quantity: 300, unit: 'g', name: 'Mehl' },
      { quantity: 6, name: 'Eier' },
      { quantity: 1, unit: 'TL', name: 'Salz' },
      { quantity: 1, unit: 'EL', name: 'Grieß' },
      { quantity: 1, unit: 'Tasse', name: 'Wasser' }
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
      'Das warme Wasser mit Salz und Hefe mischen.',
      '10% des Mehls hinzugeben und gut verrühren.',
      'Direkt danach den Rest des Mehls hinzugeben und mit Knethaken durchkneten.',
      'Den Teig mit einem feuchten Tuch abdecken und 2 Stunden bei Zimmertemperatur stehen lassen.',
      'Forme den Teig in 2 Kugeln und lasse ihn weitere 6-8 Stunden ruhen.',
      'Danach übersteht der Teig bis zu 3 Tage, wenn er im Kühlschrank gelagert wird.'
    ],
    ingredients: [
      { quantity: 200, unit: 'ml', name: 'warmes Wasser' },
      { quantity: 360, unit: 'g', name: 'Mehl (Typ 405)' },
      { quantity: 10, unit: 'g', name: 'Salz' },
      { quantity: 3, unit: 'g', name: 'Trockenhefe' }
    ]
  },
  {
    meta: {
      portion: 8,
      duration: 180,
      category: 'Herzhaft'
    },
    title: 'Sauerbraten',
    image: '/recipes/sauerbraten.png',
    description: [
      'Die Beize',
      'Rotwein und Essig mischen.',
      'Suppengrün putzen, waschen und zusammen mit den Zwiebeln klein schneiden.',
      'Pfefferkörner, Nelken, Wacholderbeeren und Pimentkörner im Mörser zerkleinern und in die Flüssigkeit geben.',
      'Schmorbraten in die Flüssigkeit legen, Suppengrün und Lorbeerblätter dazu geben. Der Schmorbraten muss mit Flüssigkeit bedeckt sein, falls nicht, einfach etwas Wasser hinzu geben.',
      'Das Ganze abdecken und 2-7 Tage kühl lagern. Je länger, desto zarter wird das Fleisch.',
      '',
      'Die Soße',
      'Das Fleisch aus der Beize nehmen, trockentupfen, mit Salz einreiben und im Bräter rundherum anbraten.',
      'Nebenher die Beize durch einen Sieb geben, alles Feste wird zusammen mit Tomaten, Rosinen, Gemüsebrühpulver und dem Fleisch angebraten, die Flüssigkeit aufbewahren!',
      'Mit Butter und Mehl eine "Mehlschwitze" vorbereiten, in einem extra Topf.',
      'Mehlschwitze mit der Beize ablöschen und alles zusammen in den Bräter zum Fleisch geben.',
      'Alles für 30 Minuten zugedeckt köcheln lassen.',
      'Pumpernickel zerbröckeln und weitere 90 Minuten im geschlossenen Topf köcheln lassen.',
      'Fleisch heraus nehmen, in Scheiben schneiden und warm halten.',
      'Mit einem Pürierstab alles in der Soße zu einem Brei zerkleinern',
      'Die Soße wird durch einen feinen Sieb gegossen und das pürierte Gemüße so weit wie möglich durch den Sieb gedrückt.',
      'Fleisch wieder in die Soße geben oder extra anrichten.',
      'Dazu passen Spätzle und Blaukraut/Rotkraut.'
    ],
    ingredients: [
      { section: 'Beize' },
      { quantity: 700, unit: 'ml', name: 'trockener Rotwein' },
      { quantity: 200, unit: 'ml', name: 'Rotweinessig' },
      { quantity: 1, unit: 'Bund', name: 'Suppengrün' },
      { quantity: 4, name: 'Nelken' },
      { quantity: 2, name: 'Lorbeerblätter' },
      { quantity: 4, name: 'Wacholderbeeren' },
      { quantity: 2, name: 'Pimentkörner' },
      { quantity: 8, name: 'Pfefferkörner' },
      { quantity: 1, unit: 'Kg', name: 'Rinderschmorbraten' },
      { section: 'Soße' },
      { quantity: 1, name: 'Tomate' },
      { quantity: 50, unit: 'g', name: 'Rosinen' },
      { quantity: 100, unit: 'g', name: 'Pumpernickel' },
      { quantity: 1, unit: 'EL', name: 'Gemüsebrühe (Pulver)' }
    ]
  },
  {
    meta: {
      portion: 3,
      duration: 40,
      category: 'Herzhaft'
    },
    title: 'Ofengemüße mit Rotweinmarinade',
    image: '/recipes/ofengemuesse.jpg',
    description: [
      'Gemüße waschen und schälen.',
      'Gemüße in sehr dünne Scheiben schneiden. Am Besten man kann durch die Scheiben fast hindurch sehen.',
      'Zusammen mit den Flüssigkeiten und den Gewürzen in eine große Schüssel geben und gut durchmischen.',
      'Alles in eine Backform geben und den Käse darüber verteilen.',
      'Bei 225 °C Ober-Unterhitze für 30 Minuten backen.',
      'Mit frischem Baguette oder Brot servieren'
    ],
    ingredients: [
      { quantity: 4, name: 'große Kartoffeln' },
      { quantity: 1, name: 'Zucchini' },
      { quantity: 5, name: 'Karotten' },
      { quantity: 1, name: 'große Zwiebel' },
      { quantity: 1, unit: 'Zehe', name: 'Knoblauch' },
      { quantity: 200, unit: 'g', name: 'Schafskäse' },
      { quantity: 3, unit: 'EL', name: 'Rotwein' },
      { quantity: 3, unit: 'EL', name: 'Essig' },
      { quantity: 3, unit: 'EL', name: 'Orangensaft' },
      { name: 'Öl' },
      { name: 'Salz' },
      { name: 'Pfeffer' }
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
      'Zutaten für den Mürbteig in eine Schüssel geben und gut vermengen. Ist der Teig nicht mürbe genug noch etwas Mehl hinzu geben.',
      'Teig dünn ausrollen.',
      `Eine hohe Springform mit etwas Butter einfetten und den Teig vorsichtig hinein legen. Der
      Teig sollte bis an den Rand der Springform reichen.`,
      'Die Gläser mit den Sauerkirschen durch einen Sieb leeren, den Saft der Gläser in einem Messbecher auffangen.',
      '0,5 Liter des Saftes mit den Kirschen und dem Tortenguss in einen Topf geben und erhitzen, dabei immer gut rumrühren.',
      'Ist der Saft heiß und leicht zähflüssig, sollte er für 10 Minuten auf einer kühlen Herdplatte stehen.',
      'Den Inhalt des abgekühlten Topfes gleichmäßig in der Springform verteilen.',
      'Alle zutaten der Streusel in einer Schüssel gut durchkneten, bis kleine Streusel entstehen.',
      'Streusel über die Kirschmasse geben.',
      '40 Minuten bei 180°C Umluft backen lassen.',
      'Den Kuchen gut auskühlen lassen, bevor die Sahne drauf kommt.',
      '2 Becher Sahne steif schlagen und ein Esslöffel Zucker dazu geben.',
      'Die Sahne auf dem abgekühlten Kuchen verteilen und für die Optik mit einer Gabel ein Wellenmuster in die Sahne malen.'
    ],
    ingredients: [
      { section: 'Mürbteig' },
      { quantity: 250, unit: 'g', name: 'Mehl' },
      { quantity: 50, unit: 'g', name: 'Margarine' },
      { quantity: 80, unit: 'g', name: 'Zucker' },
      { quantity: 1, name: 'Ei' },
      { quantity: 1, unit: 'Schuss', name: 'Milch' },
      { quantity: 0.5, unit: 'Pck.', name: 'Backpulver' },
      { section: 'Kirschbelag' },
      { quantity: 0.5, unit: 'L', name: 'des Kirschsaftes' },
      { quantity: 3, unit: 'EL', name: 'Zucker' },
      { quantity: 1, unit: 'Pck.', name: 'Roter Tortenguss' },
      { name: 'abgetropfte Kirschen' },
      { section: 'Streusel' },
      { quantity: 90, unit: 'g', name: 'Mehl' },
      { quantity: 90, unit: 'g', name: 'Butter' },
      { quantity: 90, unit: 'g', name: 'geriebene Haselnüsse' },
      { quantity: 90, unit: 'g', name: 'Zucker' },
      { name: 'Zimt' }
    ]
  },
  {
    meta: {
      portion: 15,
      duration: 20,
      category: 'Süßspeise'
    },
    title: 'Pfannkuchen',
    image: '/recipes/pfannkuchen.jpg',
    description: [
      'Mehl, Milch, Eier und eine Prise Salz mit dem Handrührgerät zu einem glatten Teig verrühren, bis dieser leichte Blasen wirft.',
      'Teig für ca. 30 Minuten im Kühlschrank ruhen lassen.',
      'Den Teig aus dem Kühlschrank nehmen, noch einen guten Schuss Mineralwasser hinzufügen und das Ganze nochmals kurz durchrühren.',
      'Die Pfannenkuchen in einer beschichtetetn Pfanne mit etwas Butter heraus braten, bis sie goldgelb sind.'
    ],
    ingredients: [
      { quantity: 400, unit: 'g', name: 'Mehl' },
      { quantity: 750, unit: 'ml', name: 'Milch' },
      { quantity: 1, unit: 'Prise', name: 'Salz' },
      { quantity: 3, name: 'Eier' },
      { quantity: 1, unit: 'Schuss', name: 'Mineralwasser' }
    ]
  },
  {
    meta: {
      portion: 10,
      duration: 120,
      category: 'Süßspeise'
    },
    title: 'Dampfnudeln',
    image: '/recipes/dampfnudeln.jpg',
    description: [
      'Aus Mehl, Butter, Eiern, lauwarmer Milch, Salz und aufgelöster Hefe einen Teig rühren. Dabei so lange schlagen, bis er Blaßen wirft.',
      'Teig an einen warmen Ort bringen und mit einem Küchentuch abgedeckt dort etwa 2 Stunden gehen lassen.',
      'Danach den Teig in kleine Kugeln formen und wieder etwa 2 Stunden gehen lassen.',
      'In eine Pfanne eine Tasse Milch, 50 g Butter (wahlweiße mit etwas Wasser vermischen) und eine Prise Salz geben. Das Ganze etwas aufwärmen, bis die Butter verlaufen ist.',
      'Nun die Teiglinge dicht an dicht in der Pfanne platzieren und mit einem Deckel verschließen.',
      'Das Ganze bei mittlerer Temperatur kochen lassen, bis die Milch vollständig verkocht ist und sich eine Kruste am Pfannenboden gebildet hat.'
    ],
    ingredients: [
      { quantity: 500, unit: 'g', name: 'Mehl' },
      { quantity: 100, unit: 'g', name: 'Butter' },
      { quantity: 200, unit: 'ml', name: 'Milch' },
      { quantity: 2, name: 'Eier' },
      { quantity: 1, unit: 'Priese', name: 'Salz' },
      { quantity: 20, unit: 'g', name: 'Hefe' }
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
      'Rhabarber schälen und in kleine Stücke schneiden. Mit etwa 4 Esslöffel Zucker vermischen und einziehen lassen.',
      'Backform mit etwas Butter einfetten.',
      'Die Zutaten des Teiges in eine Schüssel geben und kräftig durchkneten.',
      'Teig ausrollen und in die Form geben.',
      'Teig mit Zimt bestreuen und die Semmelbrösel gleichmäßig verteilen.',
      'Die Zutaten vom Guss - außer der Schlagsahne - in einer Schüssel anrühren.',
      'Schlagsahne steif schlagen und ebenfalls in die Schüssel geben.',
      'Rhabarber in die Form mit dem Teig geben und den Guss darüber geben. Etwas Zimt darüber streuen.',
      'Den Kuchen nun auf der 2. Schiene von unten etwa 60 Minuten lang bei 160° C Umluft backen lassen.'
    ],
    ingredients: [
      { section: 'Teig' },
      { quantity: 300, unit: 'g', name: 'Mehl' },
      { quantity: 0.5, unit: 'Pck.', name: 'Backpulver' },
      { quantity: 80, unit: 'g', name: 'Zucker' },
      { quantity: 1, name: 'Ei' },
      { quantity: 50, unit: 'g', name: 'Margarine' },
      { quantity: 1, unit: 'Hand voll', name: 'Semmebrösel' },
      { quantity: 1, unit: 'Spritzer', name: 'Milch' },
      { name: 'Zimt' },
      { section: 'Guss' },
      { quantity: 1, unit: 'kg', name: 'Rhabarber' },
      { quantity: 1, unit: 'EL', name: 'Mehl' },
      { quantity: 3, name: 'Eier' },
      { quantity: 1, unit: 'Pck.', name: 'Vanille-Zucker' },
      { quantity: 2, unit: 'Becher', name: 'Schmand' },
      { quantity: 1, unit: 'Becher', name: 'Schlagsahne' },
      { quantity: 150, unit: 'g', name: 'Zucker' }
    ]
  },
  {
    meta: {
      portion: 7,
      duration: 70,
      category: 'Süßspeise'
    },
    title: 'Rotweinkuchen',
    image: '/recipes/rotweinkuchen.png',
    description: [
      'Backofen auf 180° vorheizen.',
      'Butter, Zucker und die Eier in einer Schüssel schaumig aufschlagen.',
      'Den Rest in einer extra Schüssel vermengen. Den Inhalt der ersten Schüssel unterheben.',
      'Backform mit etwas Butter einfetten und den Teig hinein geben.',
      'Die Form in den Ofen geben und 50-60 Minuten backen lassen.'
    ],
    ingredients: [
      { quantity: 250, unit: 'g', name: 'Butter' },
      { quantity: 200, unit: 'g', name: 'Zucker' },
      { quantity: 4, name: 'Eier' },
      { quantity: 250, unit: 'g', name: 'Mehl' },
      { quantity: 150, unit: 'g', name: 'Schokostreusel' },
      { quantity: 3, unit: 'Pck.', name: 'Vanille-Zucker' },
      { quantity: 1, unit: 'EL', name: 'Zimtpulver' },
      { quantity: 1, unit: 'EL', name: 'Kakaupulver' },
      { quantity: 125, unit: 'ml', name: 'Rotwein' },
      { quantity: 1, unit: 'Pck.', name: 'Backpulver' }
    ]
  },
  {
    meta: {
      portion: 10,
      duration: 10,
      category: 'Getränke'
    },
    title: 'Sauerkirschbowle',
    image: '/recipes/sauerkirschbowle.jpg',
    description: [
      'Kirschen zusammen mit Zucker und Rum in eine Schüssel geben und durchmischen.',
      'Etwa 12h einziehen lassen und ab und zu herumrühren.',
      'Den Rest in die Schüssel hinzugeben und servieren.'
    ],
    ingredients: [
      { quantity: 1.5, unit: 'kg', name: 'Sauekirschen (Tiefgefrohren)' },
      { quantity: 1, unit: 'Tasse', name: 'Rum 40%' },
      { quantity: 1, unit: 'Tasse', name: 'Zucker' },
      { quantity: 0.7, unit: 'L', name: 'Limonade' },
      { quantity: 0.7, unit: 'L', name: 'Sekt' },
      { quantity: 0.7, unit: 'L', name: 'Rotwein' }
    ]
  }

]
