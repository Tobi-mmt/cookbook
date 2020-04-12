import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Icon } from './icon'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

const OffCanvas = ({ children, open, onClose, className, direction, ...rest }) => (
  <>
    <div {...rest} className={classNames('off-canvas', `off-canvas--from-${direction}`, { 'off-canvas--open': open }, className)}>
      <div name='close' className='close-icon' onClick={onClose}><Icon icon={faTimes} /></div>
      {children}
    </div>
    <div className={classNames('off-canvas__click-out', { 'off-canvas__click-out--open': open })} onClick={onClose} />
    <style jsx>{`
      .off-canvas {
        width: 100%;
        height: 100vh;
        position: fixed;
        top: 0;
        right: 0;
        z-index: 200;
        transform: translateX(100%);
        transition: transform 0.2s ease-out;
        background-color: #fff;
        overflow-x: hidden;
        overflow-y: scroll;
      }

      @media (min-width: 700px) {
        .off-canvas{
          max-width: 400px;
        }
      }

      .off-canvas--from-left {
        transform: translateX(-100%);
        right: unset;
        left: 0;
      }

      .off-canvas--open {
        transform: translateX(0);
      }

      .off-canvas__click-out {
        visibility: hidden;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 199;
        background-color: #000;
        opacity: 0;
        cursor: pointer;
        transition: visibility 0s, opacity 0.2s ease-in-out;

      }
      .off-canvas__click-out--open {
        opacity: 0.25;
        visibility: visible;
      }

      .close-icon {
        cursor: pointer;
        position: absolute;
        top: 1em;
        right: 1em;
        z-index: 10;
      }
      }
    `}
    </style>
  </>
)

OffCanvas.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  direction: PropTypes.oneOf(['left', 'right']),
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired
}

OffCanvas.defaultProps = {
  className: '',
  direction: 'right',
  onClose: () => { }
}

export { OffCanvas }
