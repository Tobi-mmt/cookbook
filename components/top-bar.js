import React from 'react'
import { Icon } from './icon'
import { faBars, faFilter } from '@fortawesome/free-solid-svg-icons'

const TopBar = () => (
  <>
    <div className='top-bar'>
      <div><Icon icon={faBars} /></div>
      <div>Tobi's Kochbuch</div>
      <div><Icon icon={faFilter} /></div>
    </div>

    <style jsx>{`
      .top-bar {
        background: #fff;
        box-shadow: 0 0 25px #0005;
        display: flex;
        justify-content: space-between;
        padding: 1em 1.5em;
        position: sticky;
        top: 0;
        z-index: 10;
      }
    `}
    </style>
  </>
)

export { TopBar }
