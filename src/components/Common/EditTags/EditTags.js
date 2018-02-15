import React from 'react';
import utils from '../../../utils/utils';

class EditTags extends React.Component {

  constructor(props) {
    super(props);
  }

  onChange(event) {
    let newValue = utils.cloneObject(event.target.value);

    this.props.onChange(newValue);
  }

  removeTag(index) {
    let tagsList = this.props.value.toLowerCase().split(' ');
    tagsList.splice(index, 1);
    this.props.onChange(tagsList.join(' '));
  }

  renderTags() {
    let tagsList = this.props.value.toLowerCase().split(' ');
    return tagsList.map((tag, index) => {
      if (utils.isEmptyString(tag)) {
        return null;
      }
      return (
        <div className="tag_edi-tag" key={index}>
          <div className="text_edi-tag">
            {tag}
          </div>
          <div className="remove-btn_edi-tag" onClick={this.removeTag.bind(this, index)}/>
        </div>
      )
    });
  }

  render() {

    return (
      <div className="container_edi-tag">
        {this.renderTags.bind(this)()}
      </div>
    );
  }
}

export default EditTags;
