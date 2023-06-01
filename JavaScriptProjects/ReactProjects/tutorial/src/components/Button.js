import PropTypes from 'prop-types'


const Button = ({color, textColor, text, fn, floatAlign}) => {
  return (
    <input type='button' className="btn" 
      style={{
        backgroundColor: color, 
        color: textColor,
        float: floatAlign ? floatAlign : 'none',
      }} 
      onClick={fn} value={text}>
    </input>
  )
}


Button.defaultProps = {
  color: "black",
  textColor: "white",
  value: "placeholder",
  floatAlign: null,

  fn: () => {}
}

Button.propTypes = {
  color: PropTypes.string,
  textColor: PropTypes.string,
  value: PropTypes.string,
  floatAlign: PropTypes.string,
  fn: PropTypes.func //.isRequired
}

export default Button