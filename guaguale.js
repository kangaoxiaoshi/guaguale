(function(factory){
	window.Guaguale=factory()||{};
})(
	function(){
		var hastouch=(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()))?true:false,
			tapstart=hastouch?"touchstart":"mousedown",
			tapmove=hastouch?"touchmove":"mousemove",
			tapend=hastouch?"touchend":"mouseup";
		function Guaguale(el,options){
			if(typeof el ==="string"){
				el = document.querySelector(el);
			}
			this.el=el;
			this.options={
				start:noop,
				move:noop,
				end:noop,
				radius:10,
				removeAll:true,
				removePercent:0.7,
				lineWidth:15,
				cover:{
					type:'color',
					cover:'#CCC'
				}
			};
			$.extend(this.options,options,true);
		};

		Guaguale.prototype.init=function(obj){
			this.el.innerHTML='';
			var self=this;
			this.valid=false;
			obj=obj||{ready:true};
			this.ready=obj.ready;
			this.el.addEventListener(tapstart,this._start.bind(this),false);
				

			this.frontcanvas = this.frontcanvas || createElement('canvas', {
					style: 'position:absolute;z-index:1'
				});

			this.backgroundcanvase=this.backgroundcanvase || createElement('canvas',{
					style: 'position:absolute;'
				});
			this.el.appendChild(this.frontcanvas);
			this.el.appendChild(this.backgroundcanvase);
			this.clientRect=this.el.getBoundingClientRect();

			this.ctx=this.frontcanvas.getContext('2d');
			this.background=this.backgroundcanvase.getContext('2d');
			//reset canvse size
			resizeCanvas(this.frontcanvas,this.el.clientWidth,this.el.clientHeight);
			if(this.options.cover.type==='img'){
				var img = new Image();
				img.src = this.options.cover.cover;
				img.crossOrigin = "anonymous";
				img.onload = function() {
					self.ctx.drawImage(img, 0, 0,self.frontcanvas.width,self.frontcanvas.height);
					self._showContent(obj);
				};
			}else if(this.options.cover.type==='color') {
				this.ctx.fillStyle=this.options.cover.cover;
				this.ctx.fillRect(0,0,this.el.clientWidth,this.el.clientHeight);
				this._showContent(obj);
			}else if(this.options.cover.type==='text'){
				this.ctx.save();
				this.ctx.fillStyle=this.options.cover.backgroundcolor ||'#CCC';
				this.ctx.fillRect(0,0,this.frontcanvas.width,this.frontcanvas.height);
				this.ctx.restore();
				this.ctx.save();
				this.ctx.font=(this.options.cover.fontStyle || " Bold ") + (" "+this.options.cover.fontSize || " 30px") + " Arial";
				this.ctx.textAlign="center";
				this.ctx.fillStyle=this.options.cover.color||"#000";
				this.ctx.fillText(this.options.cover.cover, this.frontcanvas.width / 2, this.frontcanvas.height / 2);
				this.ctx.restore();
				this._showContent(obj);
			}
			
		};
		//显示奖项内容
		Guaguale.prototype._showContent=function(obj){	
				self=this;			
				resizeCanvas(self.backgroundcanvase,self.el.clientWidth,self.el.clientHeight);
				this.background.clearRect(0,0,this.el.clientWidth,this.el.clientHeight);
				self.background.font=(self.options.cover.fontStyle || " Bold ") + (" "+self.options.cover.fontSize || " 30px") + " Arial";
				self.background.fillStyle='#FFF5DC';
				self.background.fillRect(0,0,self.el.clientWidth,self.el.clientHeight);
				if(obj.contents&&obj.contents.length){
					for(var i=0,length=obj.contents.length;i<length;i++){					
							var content=obj.contents[i];						
							switch(content.type){
								case "text":
									self.background.textAlign="center";
									self.background.fillStyle=content.fontStyle;
									self.background.fillText(content.title, (self.backgroundcanvase.width / 2)*content.x, (self.backgroundcanvase.height / obj.totalLength)*content.y);
									break;
								case "button":
									self.background.beginPath();
									self.background.lineWidth="1";
									self.background.strokeStyle= content.coverStyle;
									self.background.rect((self.backgroundcanvase.width/2)*content.x1,(self.backgroundcanvase.height/obj.totalLength)*content.y1,self.backgroundcanvase.width / 3.5,self.backgroundcanvase.height / 3.8);
									self.background.stroke();
									self.background.fillStyle=content.coverStyle;
									self.background.fillRect((self.backgroundcanvase.width/2)*content.x1,(self.backgroundcanvase.height/obj.totalLength)*content.y1,self.backgroundcanvase.width / 3.5,self.backgroundcanvase.height / 3.8);

									self.background.textAlign="center";
									self.background.fillStyle=content.fontStyle;
									self.background.fillText(content.title, (self.backgroundcanvase.width / 2)*content.x2, (self.backgroundcanvase.height / obj.totalLength)*content.y2);
									break;
							}
					}
				}				
			}
		//Guaguale.prototype._showContent=showContent;

		Guaguale.prototype._start=function(e){			
			this.ctx.lineCap="round";
			this.ctx.lineJoin="round";
			this.ctx.lineWidth = this.options.lineWidth * 2;
			this.ctx.globalCompositeOperation="destination-out";
			
			// this.startX=this.endX=hastouch?(e.touches[0].pageX-this.clientRect.left-this.$window.scrollLeft):(e.clientX-this.clientRect.left);
			// this.startY=this.endY=hastouch?(e.touches[0].pageY-this.clientRect.top-this.$window.scrollTop):(e.clientY-this.clientRect.top);
			this.startX=this.endX=hastouch?(e.touches[0].pageX-this.el.getBoundingClientRect().left):(e.clientX);
			this.startY=this.endY=hastouch?(e.touches[0].pageY-this.el.getBoundingClientRect().top):(e.clientY);			
			e.preventDefault();
			this.ctx.save();
			this.ctx.beginPath();
			//画橡皮擦的圆形
			this.ctx.arc(this.startX,this.startY,this.options.radius,0,2*Math.PI);
			this.ctx.clip();
			this.ctx.fill();
			this.ctx.restore();
			if(!this.moveHandle){
				this.moveHandle=this._move.bind(this);
			}
			if(!this.endHandle){
				this.endHandle=this._end.bind(this);	
			}									
			
			if(this.ready){
				this.el.addEventListener(tapmove,this.moveHandle,false);
				this.el.addEventListener(tapend,this.endHandle,false);
			}else{
				this.el.removeEventListener(tapmove,this.moveHandle,false);
				this.el.removeEventListener(tapend,this.endHandle,false);
			}
			
			//调用用户自定义的start 事件
			this.options.start.call(this);
		};

		Guaguale.prototype._move=function(e){
			//橡皮擦滑动
			this.endX=hastouch?(e.touches[0].pageX-this.el.getBoundingClientRect().left):(e.clientX);
			this.endY=hastouch?(e.touches[0].pageY-this.el.getBoundingClientRect().top):(e.clientY);			
			this.ctx.save();
			this.ctx.moveTo(this.startX,this.startY);
			this.ctx.lineTo(this.endX,this.endY);
			this.ctx.stroke();
			this.ctx.restore();		
			this.diffX=this.endX-this.startX;
			this.diffY=this.startY-this.endY;	
			this.startX=this.endX;
			this.startY=this.endY;
			//获取擦除比例，当擦除多少时直接自动全部清除
			if(this.options.removePercent){
				//debugger;
				var percent=getTransparentPercent(this.ctx,this.el.clientWidth,this.el.clientHeight);

				if(percent>this.options.removePercent){
					this.valid=true;
					this.ctx.clearRect(0,0,this.el.clientWidth,this.el.clientHeight);
					this.el.removeEventListener(tapmove,this.moveHandle,false);
				}
			}
			e.preventDefault();
			this.options.move.call(this);
		};

		Guaguale.prototype._end=function(e){
			this.el.removeEventListener(tapmove,this.moveHandle,false);
			this.options.end.call(this);
		};

		//空函数
		function noop(){
		};
		//创建元素
		function  createElement(tagName, attributes) {
			var ele = document.createElement(tagName);
			for (var key in attributes) {
				ele.setAttribute(key, attributes[key]);
			}
			return ele;
		};
		//重置canvse大小
		function resizeCanvas (canvas, width, height) {
			canvas.width = width;
			canvas.height = height;
			canvas.getContext('2d').clearRect(0, 0, width, height);
		};
		//获取比例
		function getTransparentPercent (ctx, width, height) {
			var imgData = ctx.getImageData(0, 0, width, height),
				pixles = imgData.data,
				transPixs = [];
			for (var i = 0, j = pixles.length; i < j; i += 4) {
				var a = pixles[i + 3];

				if (a < 128) {
					transPixs.push(i);
				}
			}
			return (transPixs.length / (pixles.length / 4)).toFixed(2);
		};

		return Guaguale;
	});
