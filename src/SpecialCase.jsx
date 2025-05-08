const { isAuthenticated, user } = useSelector((state) => state.auth);

console.log("Auth State:", { isAuthenticated, user });