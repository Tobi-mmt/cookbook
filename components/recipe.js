import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { slugerize } from '../lib/slugerize'
import { Icon } from '../components/icon'
import { faUsers, faStopwatch, faTag, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'

const Recipe = ({ recipe }) => {
  const [portion, setPortion] = useState(recipe.meta.portion)
  const increasePortion = () => {
    setPortion(portion + 1)
  }
  const reducePortion = () => {
    if (portion > 0) {
      setPortion(portion - 1)
    }
  }
  const calcQuantity = (quantity) => {
    const newValue = quantity * portion / recipe.meta.portion
    return Number(Math.round(newValue + 'e' + 1) + 'e-' + 1)
  }
  return (
    <section id={slugerize(recipe.title)} className='recipe'>
      <div className='header' style={{ backgroundImage: `url(${recipe.image})` }}>
        <div className='image' />
        <div className='infos'>
          <h1 className='title'>{recipe.title}</h1>
          <div className='meta'>
            <div className='meta-item'>
              <Icon icon={faUsers} />
              <p>{portion}</p>
            </div>
            <div className='meta-item'>
              <Icon icon={faStopwatch} />
              <p>{recipe.meta.duration} min</p>
            </div>
            <div className='meta-item'>
              <Icon icon={faTag} />
              <p>{recipe.meta.category}</p>
            </div>
          </div>

        </div>
      </div>
      <div className='content'>
        <div className='description'>{recipe.description.map(d => <p key={d}>{d}</p>)}</div>
        <div className='ingredients'>
          <table>
            <tbody>
              <tr className='portion-settings--wrapper'>
                <td className='portion-label'>
                  <p>Portionen</p>
                </td>
                <td>
                  <div className='portion-settings'>
                    <Icon onClick={increasePortion} icon={faPlus} />
                    <p>{portion}</p>
                    <Icon onClick={reducePortion} icon={faMinus} />
                  </div>
                </td>
              </tr>
              {recipe.ingredients.map(ingredient => (
                <tr key={JSON.stringify(ingredient)}>
                  {ingredient.section
                    ? (
                      <>
                        <td />
                        <td className='ingredients-headline'>{ingredient.section}</td>
                      </>
                    )
                    : (
                      <>
                        <td>{calcQuantity(ingredient.quantity)} {ingredient.unit}</td>
                        <td>{ingredient.name}</td>
                      </>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
      <style jsx>{`
            main{
              max-width: 1250px;
              margin: auto;
            }
            .recipe {
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
              background-position: left center;
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
              overflow: hidden;
              max-width: 100%;
            }
            .meta {
              display: flex;
            }
            .meta-item {
              color: #333;
              display: flex;
              align-items: center;
            }
            .meta-item p {
              margin: 0 1em 0 .25em;
            }
            .meta-item {
              margin: 0 1em 0 0;
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
            .ingredients .portion-settings--wrapper{
              font-size: 1em;
              height: 3em;
            }
            .ingredients .portion-settings {
              display: flex;
              justify-content: left;
              align-items: center;
            }
            .ingredients .portion-label p {
              margin: 0;
            }
            .ingredients .portion-settings p {
              margin: 0 .75em;
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
                padding: 2em 1em;
              }
              .ingredients {
                border: none;
              }
              .recipe {
                margin: 5em 0;
              }
              .infos {
                bottom: 1.5em;
                padding: 1em;
              }
            }
          `}
      </style>
      <style jsx>{`
            @media print {
              .ingredients {
                min-width: 15em;
              }
              .header {
                height: 8cm;
                max-height: unset;
                min-height: unset;
              }
              .recipe {
                margin: 5em 1.5em;
                break-before: page;
                box-shadow: 0 0 5px #0002;
              }
            }
          `}
      </style>
    </section>
  )
}

Recipe.propTypes = {
  recipe: PropTypes.shape({
    meta: PropTypes.shape({
      portion: PropTypes.number.isRequired,
      duration: PropTypes.number.isRequired,
      category: PropTypes.string.isRequired
    }).isRequired,
    title: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    description: PropTypes.arrayOf(PropTypes.string).isRequired,
    ingredients: PropTypes.arrayOf(PropTypes.shape({
      quantity: PropTypes.number,
      unit: PropTypes.string,
      name: PropTypes.string,
      section: PropTypes.string
    })).isRequired
  }).isRequired
}

export { Recipe }
