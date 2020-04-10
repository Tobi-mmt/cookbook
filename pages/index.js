import Head from 'next/head'
import { recipes } from "../lib/recipe"

const Home = () => (
  <div className="container">
    <Head>
      <title>Tobi's Kochbuch</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <main>
      <header>
        <h1> Tobi's Kochbuch</h1>
      </header>
      {recipes.map(recipe => (
        <section key={recipe.image} className="recipe">
          <div className="header" style={{ backgroundImage: `url(${recipe.image})` }}>
            <div className="image" >
            </div>
            <div className="infos">
              <h1 className="title">{recipe.title}</h1>
              <div className="meta">
                <p className="meta-item portion">{recipe.meta.portion}</p>
                <p className="meta-item duration">{recipe.meta.duration}</p>
                <p className="meta-item category">{recipe.meta.category}</p>
              </div>

            </div>
          </div>
          <div className="content">
            <div className="description">{recipe.description.map(d => <p>{d}</p>)}</div>
            <div className="ingredients">
              <table>
                {recipe.ingredients.map(ingredient => (
                  <tr>
                    {ingredient.section ? <>
                      <td className="ingredients-headline">{ingredient.section}</td>
                      <td></td>
                    </>
                      : <>
                        <td>{ingredient.quantity}</td>
                        <td>{ingredient.name}</td>
                      </>
                    }
                  </tr>
                ))}
              </table>
            </div>

          </div>
        </section>
      ))}

    </main>

    <style jsx>{`
      header{
        text-align: center;
      }
      header h1 {
        font-weight: normal;
      }
      main{
        max-width: 1500px;
        margin: auto;
      }
      .recipe {
        break-before: always;
        box-shadow: 0 0 25px #0005;
        margin: 5em 1.5em;
      }
      .recipe:first-of-type{
        margin-top: 2em;
      }
      .header {
        min-height: 12cm;
        position: relative;
        background-size: cover;
        background-position: left top;
        height: 40vw;
        max-height: 550px;
      }
      .title {
        padding: 0;
        font-weight: 200;
        margin: 0;
        font-size: 2.5em;
      }
      .infos {
        position: absolute;
        bottom: 3em;
        background: #fffd;
        padding: 1em 1em 1em 3em;
      }
      .meta {
        display: flex;
      }
      .portion::before {
        background: url("/icons/portion.png") no-repeat;
      }
      .duration::before {
        background: url("/icons/duration.png") no-repeat;
      }
      .category::before {
        background: url("/icons/category.png") no-repeat;
      }
      .meta-item {
        margin: 0 1em 0 0;
      }
      .meta-item::before {
        height: 1em;
        width: 1em;
        background-size: .9em;
        background-position-y: 1px;
        content: "";
        display: inline-block;
        opacity: .75;
      }
      .content {
        display: flex;
        padding: 2em;
      }
      .description {
        padding-right: 2em;
      }
      .description p:first-of-type {
        margin-top: 0;
      }
      .ingredients-headline {
        font-weight: bold;
        font-style: italic;
        padding-top: 1em;
      }
      table tr:first-of-type .ingredients-headline{
        padding-top: 0;
      }
      table tr td:first-of-type {
        text-align: right;
        padding-right: .5em;
        width: 100px;
      }
      .ingredients {
        padding:0 1em;
        border-left: 1px dotted;
        min-width: 20em;
        margin-bottom: 2em;
      }
      .ingredients table {
        margin: 0 auto;
      }
      .ingredients td {
        vertical-align: top;
        width: 200px;
      }
      @media (max-width: 700px) { 
        .content {
          flex-direction: column-reverse;
        }
        .ingredients {
          border: none;
        }
      }
    `}</style>

    <style jsx global>{`
      html,
      body {
        padding: 0;
        margin: 0;
        font-family: Helvetica Neue, sans-serif;
      }
      p {
        margin: .5em;
      }

      * {
        box-sizing: border-box;
      }
    `}</style>
  </div>
)

export default Home
