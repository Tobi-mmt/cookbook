import React, { useState } from 'react'
import { Icon } from './icon'
import { faBars, faFilter } from '@fortawesome/free-solid-svg-icons'
import { OffCanvas } from './off-canvas'

const TopBar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  return (
    <>
      <div className='top-bar'>
        <div onClick={() => setMenuOpen(true)} className='action-icon'><Icon icon={faBars} /></div>
        <div>Tobi's Kochbuch</div>
        <div onClick={() => setFilterOpen(true)} className='action-icon'><Icon icon={faFilter} /></div>
      </div>
      <OffCanvas direction='left' open={menuOpen} onClose={() => setMenuOpen(false)}>
        <p>a menu</p>

      </OffCanvas>
      <OffCanvas direction='right' open={filterOpen} onClose={() => setFilterOpen(false)}>
        <p>a filter</p>

      </OffCanvas>

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
      .action-icon {
        cursor: pointer;
      }
    `}
      </style>
    </>
  )
}

export { TopBar }
