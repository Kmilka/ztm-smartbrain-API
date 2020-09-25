const initiatePasswordReset = (postgres, bcrypt, redisClient) => (req, res) => {
    const { email } = req.body;

    if (!email) {
        return Promise.reject("incorrect email address");
      }
    
    const emailRegistered = postgres
        .select("*")
        .from("users")
        .where("email", "=", email)
        .then(data => true)
        .catch(err => false);

    if (emailRegistered) {
        generateToken();
    }

    const setToken = (redisClient, key, value) => {
        redisClient.set(key, value);
        redisClient.expire(key, 3600);
    }

    const generateLink = () => {
        

    }

    const sendLink = () => {

    }

    if (emailRegistered) {

    } 
}