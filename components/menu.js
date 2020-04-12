import React from 'react'
import ProptTypes from 'prop-types'
import { useRouter } from 'next/router'
import { recipes } from '../lib/recipe'
import { slugerize } from '../lib/slugerize'

const colors = ['#57B16B', '#DD5D58', '#8882A8']

const Menu = ({ onClick }) => {
  const router = useRouter()

  const categories = recipes.reduce((acc, recipe) => {
    if (acc[recipe.meta.category]) {
      acc[recipe.meta.category].push(recipe)
    } else { acc[recipe.meta.category] = [recipe] }
    return acc
  }, {})

  const handleLinkClick = (href) => {
    router.push(href)
    onClick()
  }

  return (
    <div className='wrapper'>
      <h2 className='headline'>Menü</h2>
      {Object.keys(categories).map((category, idx) => {
        return (
          <div key={category}>
            <h3 className='category' style={{ backgroundColor: colors[idx] }}>{category}</h3>
            <ul className='list'>
              {Object.values(categories)[idx].map(recipe => (
                <li className='list-item' key={recipe.title} onClick={() => handleLinkClick(`/#${slugerize(recipe.title)}`)}>{recipe.title}</li>
              ))}
            </ul>
          </div>
        )
      })}
      <style jsx>{`
      .headline {
        margin-top: .6em;
      }
      .category {
        color: #fff;
        padding: .5em 2.75em;
        width: 120%;
        margin-left: -10%;
      }
      .wrapper {
        padding: 0 2em 2em;
      }
      .list {
        padding-left: 1em;
      }
      .list-item {
        cursor: pointer;
        list-style: none;
        line-height: 1.3em;
      }
      .list-item:hover {
        list-style: disclosure-closed;
      }
      `}
      </style>
    </div>
  )
}

Menu.propTypes = {
  onClick: ProptTypes.func
}

Menu.defaultProps = {
  onClick: () => { }
}

export { Menu }
