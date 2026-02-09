const guestService = require("./guestService");
const configService = require("./configService");

class InvitationService {
  async getInvitationDetails(guestId) {
    const guest = await guestService.getGuestById(guestId);
    if (!guest) return null;

    const config = await configService.getConfig();

    return {
      guest,
      config,
    };
  }
}

module.exports = new InvitationService();
