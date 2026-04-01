import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordTest {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        //String hash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
        String hash = "$2a$10$HoDvRWqC70cStGZRgASczODT1F..AWTRXcE4tPsJ1BOuIk9YunAa.";

        System.out.println(encoder.matches("admin123", hash));
        //System.out.println(encoder.encode("admin123"));
    }
}
