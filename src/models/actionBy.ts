const ActionBySchema = {
  _id: {
    type: String,
    default: '',
    // required: true
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  roleLevel: {
    type: Number,
    default: 0
  },
  name: {
    type: String,
    default: ''
  }
}
export default ActionBySchema