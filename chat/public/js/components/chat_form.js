import { create_guest } from './chat_utils';
import ChatSpace from './chat_space';

export default class ChatForm {
  constructor(opts) {
    this.$wrapper = opts.$wrapper;
    this.profile = opts.profile;
    this.setup();
  }

  setup() {
    this.$chat_form = $(document.createElement('div'));
    this.$chat_form.addClass('chat-form');
    this.setup_header();
    this.setup_form();
  }

  setup_header() {
    this.avatar_html = frappe.avatar(null, 'avatar-medium', this.profile.name);
    const header_html = `
			<div class="chat-header mb-2">
				${this.avatar_html}
				<div class="chat-profile-info">
					<div class="chat-profile-name">
						${this.profile.name}
						<div class="online-circle"></div>
					</div>
					<div class="chat-profile-time">Typically replies in a few hours</div>
				</div>
				<i class="fa fa-times fa-lg chat-cross-button"></i>
			</div>
		`;
    this.$chat_form.append(header_html);
  }

  setup_form() {
    const form_html = `
			<div class='chat-form-container'>
				<p class='chat-query-heading'>Share your queries or comments here.</p>
				<form>
					<div class='form-group'>
						<label class='form-label'>Full Name</label>
						<input type='text' class='form-control' id='chat-fullname' 
							placeholder='Please enter your full name'>
					</div>
					<div class='form-group'>
						<label class='form-label'>Email Address</label>
						<input type='email' class='form-control' id='chat-email' 
							placeholder='Please enter your email'>
					</div>
					<div class='form-group'>
						<label class='form-label'>Message</label>
						<textarea class='form-control' id='chat-message-area' 
							placeholder='Please enter your message'></textarea>
					</div>
					<button type='button' class='btn btn-primary w-100'
						id='submit-form'>Start Conversation</button>
				</form>
			</div>
		`;
    this.$chat_form.append(form_html);
  }

  get_values() {
    const result = {
      email: $('#chat-email').val(),
      full_name: $('#chat-fullname').val(),
      message: $('#chat-message-area').val(),
    };
    return result;
  }

  async validate_form() {
    try {
      const form_values = this.get_values();
      const res = await create_guest(form_values);
      if ('errors' in res) {
        res.errors.forEach(function (error) {
          frappe.msgprint(error, 'Error');
        });
      } else {
        const query_message = {
          message: form_values.message,
          creation: new Date(),
          sender: res.email,
        };
        localStorage.setItem('guest_token', res.token);
        const chat_space = new ChatSpace({
          $wrapper: this.$wrapper,
          profile: {
            name: this.profile.name,
            room: res.room,
            is_admin: this.profile.is_admin,
            user: res.email,
            message: query_message,
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    this.$wrapper.html(this.$chat_form);
    const me = this;
    $('#submit-form').on('click', function () {
      me.validate_form();
    });
  }
}
