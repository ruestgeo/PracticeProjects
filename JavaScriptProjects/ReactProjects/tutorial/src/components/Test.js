import PropTypes from 'prop-types'

const Test = ({str}) => {
  return (
    <>
      {str}
    </>
  )
}

Test.defaultProps = {
  str: "test"
}

Test.propTypes = {
  str: PropTypes.string
}

export default Test