import React from 'react'
import ProptTypes from 'prop-types'
import { useRouter } from 'next/router'
import { recipes } from '../lib/recipes'
import { slugerize } from '../lib/slugerize'
import { categoryColors } from '../lib/colors'
import { faLeaf, faBacon } from '@fortawesome/free-solid-svg-icons'
import { Icon } from '../components/icon'

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
      {Object.keys(categories).map((category, idx) => {
        return (
          <div key={category}>
            <h3 className='category' style={{ backgroundColor: categoryColors[category] }}>{category}</h3>
            <div>
              <ul className='list'>
                {Object.values(categories)[idx].map(recipe => (
                  <li className='list-item' key={recipe.title} onClick={() => handleLinkClick(`/#${slugerize(recipe.title)}`)}>
                    {recipe.title}&nbsp;
                    {(!recipe.meta.vegetarian && !recipe.meta.vegan) && <Icon style={{ display: 'inline', color: '#AA3C3B' }} icon={faBacon} />}
                    {recipe.meta.vegan && <Icon style={{ display: 'inline', color: '#4CAF50' }} icon={faLeaf} />}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      })}
      <style jsx>{`
      .wrapper {
        padding-bottom: 3.5em;
        display: flex;
        flex-direction: column;
      }
      .category {
        position: sticky;
        top: 0;
        color: #fff;
        padding: .75em 1.71em;
        margin: 0;
      }
      .list {
        padding: 0 2em;
      }
      .list-item {
        cursor: pointer;
        list-style: none;
        line-height: 1.5em;
        font-size: 1.125em;
      }
      .list-item:hover {
        list-style: disclosure-closed;
      }
      @media only screen and (max-width: 800px) {
        .list-item {
          line-height: 1.7em;
        }
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
