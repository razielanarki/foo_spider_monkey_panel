_.mixin({
	rating : function (x, y, h, off, on) {
		this.paint = function (gr) {
			if (panel.metadb) {
				gr.SetTextRenderingHint(4);
				for (var i = 0; i < this.get_max(); i++) {
					gr.DrawString(guifx.star, this.guifx_font, i + 1 > (this.hover ? this.hrating : this.rating) ? this.off : this.on, this.x + (i * this.h), this.y, this.h, this.h, SF_CENTRE);
				}
			}
		}
		
		this.metadb_changed = function () {
			if (panel.metadb) {
				this.hover = false;
				this.rating = this.get_rating();
				this.hrating = this.rating;
				this.tiptext = this.properties.mode.value == 0 ? 'Choose a mode first.' : _.tf(this.tiptext_tf, panel.metadb);
			}
			window.Repaint();
		}
		
		this.trace = function (x, y) {
			return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
		}
		
		this.move = function (x, y) {
			if (this.trace(x, y)) {
				if (panel.metadb) {
					_.tt(this.tiptext);
					this.hover = true;
					this.hrating = Math.ceil((x - this.x) / this.h);
					window.RepaintRect(this.x, this.y, this.w, this.h);
				}
				return true;
			} else {
				this.leave();
				return false;
			}
		}
		
		this.leave = function () {
			if (this.hover) {
				_.tt('');
				this.hover = false;
				window.RepaintRect(this.x, this.y, this.w, this.h);
			}
		}
		
		this.lbtn_up = function (x, y) {
			if (this.trace(x, y)) {
				if (panel.metadb) {
					this.set_rating();
				}
				return true;
			} else {
				return false;
			}
		}
		
		this.rbtn_up = function (x, y) {
			_.forEach(this.modes, function (item, i) {
				panel.s10.AppendMenuItem(i == 1 && !this.foo_playcount ? MF_GRAYED : MF_STRING, i + 6000, item);
			});
			panel.s10.CheckMenuRadioItem(6000, 6003, this.properties.mode.value + 6000);
			panel.s10.AppendTo(panel.m, MF_STRING, 'Mode');
			panel.m.AppendMenuItem(this.properties.mode.value == 2 ? MF_STRING : MF_GRAYED, 6004, 'Tag name');
			panel.m.AppendMenuItem(this.properties.mode.value > 1 ? MF_STRING : MF_GRAYED, 6005, 'Max value...');
			panel.m.AppendMenuSeparator();
		}
		
		this.rbtn_up_done = function (idx) {
			switch (true) {
			case idx <= 6003:
				this.properties.mode.set(idx - 6000);
				break;
			case idx == 6004:
				var tmp = _.input('Enter a custom tag name. Do not use %%.', window.Name, this.properties.tag.value);
				if (tmp == '') {
					tmp = 'rating';
				}
				this.properties.tag.set(tmp);
				break;
			case idx == 6005:
				var tmp = _.input('Enter a maximum value.', window.Name, this.properties.max.value);
				if (tmp == '') {
					tmp = 5;
				}
				this.properties.max.set(tmp);
				break;
			}
			this.w = this.h * this.get_max();
			panel.item_focus_change();
		}
		
		this.get_rating = function () {
			switch (this.properties.mode.value) {
			case 1: // foo_playcount
				return _.tf('$if2(%rating%,0)', panel.metadb);
			case 2: // file tag, must use meta incase foo_playcount is present and user has tag named "rating"
				return _.tf('$if2($meta(' + this.properties.tag.value + '),0)', panel.metadb);
			case 3: // JScript Panel db
				return _.tf('$if2(%jsp_rating%,0)', panel.metadb);
			default:
				return 0;
			}
		}
		
		this.set_rating = function () {
			switch (this.properties.mode.value) {
			case 1: // foo_playcount
				fb.RunContextCommandWithMetadb('Rating/' + (this.hrating == this.rating ? '<not set>' : this.hrating), panel.metadb, 8);
				break;
			case 2: // file tag
				var tmp = this.hrating == this.rating ? '' : this.hrating;
				var obj = {};
				obj[this.properties.tag.value] = tmp;
				var handles = fb.CreateHandleList();
				handles.Add(panel.metadb);
				handles.UpdateFileInfoFromJSON(JSON.stringify(obj));
				handles.Dispose();
				break;
			case 3: // JScript Panel db
				panel.metadb.SetRating(this.hrating == this.rating ? 0 : this.hrating);
				break;
			}
		}
		
		this.get_max = function () {
			return this.properties.mode.value < 2 ? 5 : this.properties.max.value;
		}
		
		this.properties = {
			mode : new _.p('2K3.RATING.MODE', 0), // 0 unset 1 foo_playcount 2 file tag 3 JScript Panel db
			max : new _.p('2K3.RATING.MAX', 5), // only use for file tag/JScript Panel db mode
			tag: new _.p('2K3.RATING.TAG', 'rating')
		};
		this.x = x;
		this.y = y;
		this.h = _.scale(h);
		this.w = this.h * this.get_max();
		this.on = on;
		this.off = off;
		this.hover = false;
		this.rating = 0;
		this.hrating = 0;
		this.guifx_font = gdi.Font(guifx.font, this.h, 0);
		this.tiptext_tf = 'Rate "%title%" by "%artist%".';
		this.modes = ['Unset', 'foo_playcount', 'File Tag', 'JScript Panel DB'];
		this.foo_playcount = _.cc('foo_playcount');
		window.SetTimeout(_.bind(function () {
			if (this.properties.mode.value == 1 && !this.foo_playcount) { // if mode is set to 1 (foo_playcount) but component is missing, reset to 0.
				this.properties.mode.set(0);
			}
			if (this.properties.mode.value == 0) {
				fb.ShowPopupMessage('This script has now been updated and supports 3 different modes.\n\nAs before, you can use foo_playcount which is limited to 5 stars.\n\nThe 2nd option is writing to your file tags. You can choose the tag name and a new scale via the right click menu.\n\nLastly, a new "Playback Stats" database has been built into JScript Panel. This uses %jsp_rating% which can be accessed via title formatting in all other components/search dialogs. This also supports a custom scale.\n\nAll options are available on the right click menu. If you do not the new options when right clicking, make sure you have the latest "rating.txt" imported from the "samples\\complete" folder.', window.Name);
			}
		}, this), 500);
	}
});
