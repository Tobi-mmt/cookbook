import React from 'react'
import { recipes } from '../lib/recipes'
import { TopBar } from '../components/top-bar'
import { Recipe } from '../components/recipe'

const Home = () => (
  <div className='container'>
    <TopBar />
    <main>
      {recipes.map(recipe => (
        <Recipe key={recipes.title} recipe={recipe} />
      ))}
    </main>

    <style jsx>{`
      main{
        max-width: 1250px;
        margin: auto;
      }
    `}
    </style>

    <style jsx global>{`
      html,
      body {
        padding: 0;
        margin: 0;
        font-family: Helvetica Neue, sans-serif;
      }
      p {
        margin: .5em 0;
      }

      * {
        box-sizing: border-box;
      }
    `}
    </style>

    <style jsx>{`
      @media print {
        body {
          font-size: 12pt;
        }
        main {
          max-width: 2000px;
        }
        a:link:after { content: " (" attr(href) ") "; } 
      }
    `}
    </style>
  </div>
)

export default Home
