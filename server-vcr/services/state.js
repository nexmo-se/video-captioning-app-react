const { State } = require('neru-alpha');

const STATE_HASH_TABLE_ROOMS = 'rooms';

/**
 * 
 */
module.exports = (neru) => ({
  get neruState () {
    const neruSession = neru.getSessionById(`app:${process.env.API_APPLICATION_ID}`);
    const neruState   = new State(neruSession);
    return neruState;
  },

  async initRooms (arr) {
    const state = this.neruState;
    arr.filter(async (room, index) => {
      let id = `room-${index}`;
      await state.hset(
        STATE_HASH_TABLE_ROOMS, 
        {
          [id]: JSON.stringify({ id, ...room }) 
        }
      );
    });
  },

  // eg. roomId = room-0
  async getRoomById(id) {
    try {
      let roomStr = await this.neruState.hget(STATE_HASH_TABLE_ROOMS, id);
      return roomStr? JSON.parse(roomStr) : null;
    } catch (e) {
      return null;
    }
  },

  async addRoom(id, data) {
    try {
      let room = await this.getRoomById(id);
      if (room) return room;
      await this.neruState.hset(
        STATE_HASH_TABLE_ROOMS, 
        {
          [id]: JSON.stringify({ id, ...room, ...data }) 
        }
      );
      return await this.getRoomById(id);
    } catch (e) {
      return null;
    }
  },

  // eg. id = room-0
  async updateRoomById(id, data) {
    try {
      let room = await this.getRoomById(id);
      if (!room) return null;
      await this.neruState.hset(
        STATE_HASH_TABLE_ROOMS, 
        {
          [id]: JSON.stringify({ id, ...room, ...data }) 
        }
      );
    } catch (e) {
    }
    return await  this.getRoomById(id);
  },

  async getRoomBySessionId(sessionId) {
    try {
      const rooms = await this.neruState.hgetall(STATE_HASH_TABLE_ROOMS);
      for (const [id, roomStr] of Object.entries(rooms)) {
        let room = JSON.parse(roomStr);
        if (room && room.sessionId == sessionId) return room;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  async getCaptionsId(id) {
    let room = await this.getRoomById(id);
    return room? room.captionsId ?? null : null;
  },

  async setCaptionsId(id, captionsId) {
    await this.updateRoomById(id, { captionsId });
    return await this.getRoomById(id);
  },

});
