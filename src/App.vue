<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  }
}
</script>

<style>
/* 紫钰旗舰级样式库 */
page {
  background-color: #f8f9fc;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #1f2937;
}

.card {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.03);
}

/* 按钮规范 */
.btn-primary {
  background: linear-gradient(135deg, #7e57c2 0%, #4a148c 100%);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  text-align: center;
  border: none;
  box-shadow: 0 4px 12px rgba(126, 87, 194, 0.3);
  transition: all 0.2s;
}

.btn-primary:active {
  transform: scale(0.97);
  box-shadow: 0 2px 6px rgba(126, 87, 194, 0.2);
}

.btn-gold {
  background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

/* 文字渐变 */
.text-gradient {
  background: linear-gradient(135deg, #7e57c2 0%, #d4af37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
