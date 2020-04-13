import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Icon = ({ icon, className, ...rest }) => {
  return (
    <div className={classNames('icon', className)} {...rest}>
      <FontAwesomeIcon icon={icon} />
      <style jsx>{`
        .icon {
          width: 1em;
          display: flex;
        }`}
      </style>
    </div>

  )
}

Icon.propTypes = {
  icon: PropTypes.object.isRequired,
  className: PropTypes.string
}

Icon.defaultProps = {
  className: ''
}

export { Icon }
