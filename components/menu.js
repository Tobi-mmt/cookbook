import React from 'react'
import ProptTypes from 'prop-types'
import { useRouter } from 'next/router'
import { recipes } from '../lib/recipes'
import { slugerize } from '../lib/slugerize'
import { categoryColors } from '../lib/colors'
import { faLeaf } from '@fortawesome/free-solid-svg-icons'
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
            <ul className='list'>
              {Object.values(categories)[idx].map(recipe => (
                <li className='list-item' key={recipe.title} onClick={() => handleLinkClick(`/#${slugerize(recipe.title)}`)}>
                  {recipe.title}&nbsp;
                  {recipe.meta.vegetarian && <Icon style={{ display: 'inline', color: '#4CAF50' }} icon={faLeaf} />}
                  {recipe.meta.vegan && <Icon style={{ display: 'inline', color: '#4CAF50' }} icon={faLeaf} />}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
      <style jsx>{`
      .wrapper {
        padding: 0 2em 2em;
      }
      .category {
        position: sticky;
        top: 0;
        color: #fff;
        padding: .5em 2em;
        width: 122%;
        margin: 0 0 0 -11%;
      }
      .list {
        padding-left: 0;
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
