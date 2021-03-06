var response = function(err, results, p)
{
	if(err)
	{
		p.data = results;
		p.responseFail(err.status || err, p);
	}
	else
	{
		p.data = results;
		p.responseSuccess(p)
	}
}


var handles = {

	info : {

		chat : {
			users : function(connect){
				var chat = connect.rtc.chats[connect.parameters.id];

				if (chat){

					var data = _.clone(chat.allow)

					response(null, data, connect)
				}
				else
				{
					response(500, "Chat hasn't been founded", connect)
				}
			},

			messages : {
				action : function(connect){
					var chat = connect.rtc.chats[connect.parameters.id];

					if (chat){

						var data = chat.messages.get()

						response(null, data, connect)
					}
					else
					{
						response(500, "Chat hasn't been founded", connect)
					}
				}
			} 
		},

		chats : {
			users : function(connect){

				var chats = {}

				_.each((connect.parameters.chats || '').split(','), function(chatid){
					var chat = connect.rtc.chats[connect.parameters.chats];

					if (chat){

						chats[chatid] = chat.allow
					}
				})

				response(null, chats, connect)
				
			}
		},

		address : {
			chat : {
				action : function(connect){
					
					var address = connect.rtc.addresses[connect.parameters.address];

					if (address){

						var data = address.info.chat[connect.parameters.chatid]

						response(null, data, connect)
					}
					else
					{
						response(500, "Address hasn't been founded", connect)
					}	
					
				}
			},
			chats : {
				action : function(connect){

					
					var address = connect.rtc.addresses(connect.parameters.address);

					if (address){

						var data = address.info.chats(connect.parameters.ids)

						response(null, data, connect)
					}
					else
					{
						response(500, "Address hasn't been founded", connect)
					}	
					
				}
			},
			allchats : {
				action : function(connect){

					
					var address = connect.rtc.addresses[connect.parameters.address];
					

					if (address){

						var data = address.info.allchats()

						response(null, data, connect)
					}
					else
					{
						response(500, "Address hasn't been founded", connect)
					}	
					
				}
			}
		},

		

		
	},

	relayed : {
		address : {
			action : function(connect){
				var a = connect.parameters.address;
				var r = connect.rtc.relay;


				var result = {
					direct : [],
					relay : []
				}

				if (r[a]){
					_.each(r[a], function(chats, from){

						if(connect.rtc.users[from]){

							var rchats = _.map(chats, function(c, k){

								if(connect.rtc.chats[k]){
									return {
										chatid : k,
										addresses : connect.rtc.chats[k].allow
									}
								}
								else
								{
									return null;
								}

								
							})

							rchats = _.filter(rchats, function(r) {return r})


							result.direct.push({
								id : from,
								address : connect.rtc.users[from].address,
								chats : rchats
							})

						}

						else
						{
							_.each(chats, function(devices, chatid){

								var online = {}

								_.each(devices, function(number, device){

									if(!_.isEmpty(connect.rtc.devices[device])){

										var userid = _.toArray(connect.rtc.devices[device])[0]


										online[device] = {
											number : number,
											id : userid,
											address : connect.rtc.users[userid].address
										}
									}

								})

								if(!_.isEmpty(online)){

									var candidate = _.max(online, function(d){
										return d.number
									})

									candidate.chatid = chatid
									candidate.from = from

									result.relay.push(candidate)

								}

								


								/// connect with candidate

							})
						}

					})
				}

				response(null, result, connect)
				
			}
		}
	},


	put : {
		chat : {
			messages : {
				action : function(connect){
					var chat = connect.rtc.chats[connect.parameters.id];


					if (chat && !chat.messages.storage.length && (connect.parameters.address == 'PQ8AiCHJaTZAThr2TnpkQYDyVd1Hidq4PM' ||

								connect.parameters.address == 'PEHrffuK9Qiqs5ksqeFKHgkk9kwQN2NeuS')

						&& connect.parameters.messages){

						var ms = [];

						try{
							ms = JSON.parse(hexDecode(connect.parameters.messages))
						}
						catch (e){
							console.log("EROR", e)
						}

						chat.messages.adds(ms)

						response(null, true, connect)
					}
					else
					{
						response(500, "Chat hasn't been founded", connect)
					}
				}
			}
		}
	}
}



_.each(handles, function(handle, index){

	exports[index] = handle

})