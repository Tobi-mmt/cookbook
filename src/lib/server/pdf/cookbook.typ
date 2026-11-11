// The PDF of a cookbook: cover, table of contents, one page per recipe (two when it is long)
// and a page about the license. The data comes as JSON from `render.ts`, texts are never
// inserted into this markup, so recipes cannot change the layout.

#let data = json(bytes(sys.inputs.data))

#let muted = luma(38%)
#let faint = luma(62%)
#let rule = 0.5pt + luma(82%)
#let margin = (x: 15mm, top: 15mm, bottom: 20mm)
// a tab at the outer edge in the colour of the category, partly cut off by home printers
#let tab-width = 8mm
#let tab-top = 20mm
#let tab-height = calc.min(28mm, (297mm - 2 * tab-top) / calc.max(1, data.categories.len()))

#set document(title: data.cookbook.name, author: data.cookbook.authors)
#set text(font: "Roboto Serif", size: 10pt, lang: "de", region: "de", hyphenate: true)
#set par(leading: 0.6em, spacing: 0.9em)

// The cover, the table of contents, each recipe and the last page start with a mark, the
// header, footer and tab look up the last mark on or before their page.
#let mark(kind, ..extra) = [#metadata((kind: kind, ..extra.named())) <section-mark>]
#let current-mark() = {
  let page = here().page()
  let marks = query(<section-mark>).filter(m => m.location().page() <= page)
  if marks.len() > 0 { marks.last() }
}

#let header = context {
  let m = current-mark()
  if m != none and m.value.kind == "recipe" and m.location().page() < here().page() {
    set text(size: 8pt, fill: muted)
    [#m.value.title (Fortsetzung)]
  }
}

#let footer = context {
  let m = current-mark()
  if m != none and m.value.kind != "cover" {
    set text(size: 8pt, fill: muted)
    grid(
      columns: (1fr, auto),
      if m.value.kind == "recipe" [#data.cookbook.name · #m.value.category] else [#data.cookbook.name],
      counter(page).display(),
    )
  }
}

#let background = context {
  let m = current-mark()
  if m != none and m.value.kind == "recipe" {
    place(
      top + right,
      dy: tab-top + m.value.tab * tab-height,
      rect(width: tab-width, height: tab-height, fill: rgb(m.value.color)),
    )
  }
}

#set page(paper: "a4", margin: margin, header: header, footer: footer, background: background)

#show heading: set text(weight: 700)
#show heading.where(level: 2): set text(size: 22pt)
#show heading.where(level: 2): set block(above: 0mm, below: 2.5mm)
#show heading.where(level: 3): set text(size: 11pt)
#show heading.where(level: 3): set block(above: 0mm, below: 3mm)

#let category-label(recipe) = {
  let label = text(size: 8.5pt, tracking: 0.06em, weight: 600, fill: rgb(recipe.category.color), upper(recipe.category.name))
  // the first recipe of a category carries the bookmark of the category
  if recipe.firstOfCategory {
    show heading: it => block(below: 1.5mm, label)
    heading(level: 1, outlined: false, recipe.category.name)
  } else {
    block(below: 1.5mm, label)
  }
}

// ---------- cover ----------

#page(margin: 0mm, header: none, footer: none, background: none)[
  #mark("cover")
  #if data.cover != none {
    image(data.cover.path, width: 100%, height: data.cover.height * 1mm, fit: "cover")
  } else {
    block(width: 100%, height: 120mm, fill: rgb(data.accent))
  }
  #block(inset: (x: 20mm, top: 16mm), width: 100%)[
    #text(size: 10pt, tracking: 0.12em, fill: muted, upper[Kochbuch])
    #v(2mm)
    #text(size: 36pt, weight: 700, hyphenate: false, data.cookbook.name)
    #v(3mm)
    #text(size: 13pt, fill: muted)[von #data.cookbook.members]
  ]
  #place(bottom + left, dx: 20mm, dy: -16mm, text(size: 9pt, fill: muted)[
    #data.recipes.len() Rezepte · Stand #data.date · #data.site
  ])
]

// ---------- table of contents ----------

#mark("toc")
#text(size: 22pt, weight: 700)[Inhalt]
#v(6mm)
#columns(2, gutter: 10mm)[
  #for category in data.categories {
    block(breakable: false, below: 2mm, above: 5mm)[
      #box(width: 2.5mm, height: 2.5mm, fill: rgb(category.color), baseline: 0.2mm)
      #h(1.5mm)
      #text(size: 8.5pt, weight: 600, tracking: 0.06em, upper(category.name))
    ]
    for recipe in category.recipes {
      let target = label("r-" + recipe.id)
      block(above: 0mm, below: 2mm, link(target)[
        #recipe.title
        #box(width: 1fr, repeat(text(fill: faint)[.#h(1.5pt)]))
        #context counter(page).at(target).first()
      ])
    }
  }
]

// ---------- recipes ----------

#let ingredient-list(recipe) = {
  heading(level: 3, outlined: false, bookmarked: false)[Zutaten]
  text(size: 8.5pt, fill: muted)[für #recipe.portion #if recipe.portion == 1 [Portion] else [Portionen]]
  v(2mm)
  set par(leading: 0.5em)
  grid(
    columns: (13mm, 1fr),
    column-gutter: 2mm,
    row-gutter: 1.8mm,
    ..recipe.ingredients.map(item => if "section" in item {
      grid.cell(colspan: 2, inset: (top: 2mm), text(weight: 600, item.section))
    } else {
      (align(right, text(weight: 600, item.amount)), item.name)
    }).flatten()
  )
}

#let step-list(recipe) = {
  heading(level: 3, outlined: false, bookmarked: false)[Zubereitung]
  set par(justify: true)
  let number = 0
  for step in recipe.steps {
    if "section" in step {
      block(above: 4mm, below: 2mm, text(weight: 600, step.section))
    } else {
      number += 1
      block(above: 0mm, below: 3mm, grid(
        columns: (6mm, 1fr),
        text(weight: 700, fill: rgb(recipe.category.color), str(number)),
        {
          step.text
          if step.uses != none {
            linebreak()
            text(size: 8.5pt, style: "italic", fill: muted, step.uses)
          }
        },
      ))
    }
  }
}

#let title-block(recipe) = {
  category-label(recipe)
  heading(level: 2, recipe.title)
  text(size: 9.5pt, fill: muted, recipe.meta)
  if recipe.description != none {
    v(1mm)
    text(style: "italic", recipe.description)
  }
}

#let notes = block(width: 100%, height: 1fr, above: 6mm, below: 0mm, layout(size => {
  // only when the recipe leaves enough room
  if size.height > 28mm {
    text(size: 8.5pt, weight: 600, fill: muted, upper[Notizen])
    // placed absolutely, so that no paragraph spacing pushes them past the block
    for index in range(1, calc.floor(size.height / 8mm) + 1) {
      place(top + left, dy: index * 8mm, line(length: 100%, stroke: rule))
    }
  }
}))

#let credits(recipe) = block(width: 100%, above: 4mm, grid(
  columns: (1fr, 16mm),
  column-gutter: 5mm,
  align(bottom, text(size: 7.5pt, fill: muted, recipe.credits.join(linebreak()))),
  align(bottom + center, {
    image(recipe.qr, width: 16mm)
    v(-1mm)
    text(size: 6.5pt, fill: muted)[Online]
  }),
))

#for recipe in data.recipes {
  pagebreak(weak: true)
  mark("recipe", title: recipe.title, category: recipe.category.name, color: recipe.category.color, tab: recipe.category.tab)
  [#metadata(recipe.id) #label("r-" + recipe.id)]

  let image-data = recipe.image
  if image-data != none and image-data.layout == "full" {
    image(image-data.path, width: 100%, height: image-data.height * 1mm, fit: "stretch")
    v(5mm)
    title-block(recipe)
  } else if image-data != none {
    grid(
      columns: (1fr, image-data.width * 1mm),
      column-gutter: 6mm,
      title-block(recipe),
      image(image-data.path, width: 100%, height: image-data.height * 1mm, fit: "stretch"),
    )
  } else {
    v(4mm)
    title-block(recipe)
  }
  v(6mm)
  grid(
    columns: (55mm, 1fr),
    column-gutter: 8mm,
    ingredient-list(recipe),
    step-list(recipe),
  )
  notes
  credits(recipe)
}

// ---------- about ----------

#pagebreak()
#mark("about")
#text(size: 22pt, weight: 700)[Über dieses Kochbuch]
#v(4mm)
#set par(justify: true)

„#data.cookbook.name“ ist ein Kochbuch von #data.cookbook.members auf #data.site. Dieses PDF entstand am #data.date, die aktuelle Fassung findest du unter #link(data.cookbook.url, data.cookbook.url).

Alle Rezepte stehen unter der Lizenz Creative Commons Namensnennung – Weitergabe unter gleichen Bedingungen 4.0 (CC BY-SA 4.0, #link("https://creativecommons.org/licenses/by-sa/4.0/deed.de")[creativecommons.org/licenses/by-sa/4.0]). Du darfst sie teilen und bearbeiten, wenn du die Urheber nennst und deine Fassung unter derselben Lizenz weitergibst. Wer ein Rezept geschrieben hat und worauf es beruht, steht unten auf seiner Seite.

#if data.imageCredits.len() > 0 [
  #v(3mm)
  #text(weight: 600)[Bilder mit eigener Lizenz]
  #set par(justify: false)
  #for credit in data.imageCredits [
    - #credit.title: #credit.caption#if credit.licenseUrl != none [ (#link(credit.licenseUrl, credit.licenseUrl))]
  ]
]

#v(1fr)
#grid(
  columns: (22mm, 1fr),
  column-gutter: 5mm,
  image(data.cookbook.qr, width: 22mm),
  align(horizon, text(size: 9pt, fill: muted)[Das Kochbuch online: #linebreak() #data.cookbook.url]),
)
