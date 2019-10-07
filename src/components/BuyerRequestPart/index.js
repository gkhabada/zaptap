const InputAutocomplete = () =>
  import('../../components/InputAutocomplete/InputAutocomplete');
const InputCounter = () => import('../../components/InputCounter/InputCounter');

const props = {
  id: {
    type: Number,
  },
  picked: {
    type: Number,
    default: -1,
  },
  value: {
    type: String,
    default: '',
  },
  comment: {
    type: String,
    default: '',
  },
  original: {
    type: String,
    default: '',
  },
  media: {
    type: Array,
    required: true,
  },
  error: {
    type: Boolean,
  },
  widget: {
    type: Boolean,
    default: false,
  },
};

const computed = {
  photos() {
    return this.media.filter((v) => v.type === 'picture') || [];
  },
  videos() {
    return this.media.filter((v) => v.type === 'video') || [];
  },
  testError(){
    return (this.testCommentError || this.testNumberError) && (this.value === "" || this.value === null)
  }
};

const components = {
  InputAutocomplete,
  InputCounter,
};

const data = function () {
    return {
        testCommentError:false,
        testNumberError:false
    };
};

const methods = {
  updateField(field, value) {
    if(field === 'original')
      if (value !== '')
          this.testNumberError = true;
      else{
          this.testNumberError = false;
      }
    else{
        if (value !== '' && field === 'comment')
            this.testCommentError = true;
        else
            this.testCommentError = false;
    }

    this.$emit(field, value);
  }
};

export default {
  data,
  props,
  components,
  methods,
  computed,
};
