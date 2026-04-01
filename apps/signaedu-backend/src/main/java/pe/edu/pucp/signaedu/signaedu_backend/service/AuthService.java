package pe.edu.pucp.signaedu.signaedu_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.LoginRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.LoginResponse;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtService;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getCorreo(),
                            request.getPassword()
                    )
            );

            String token = jwtService.generarToken(request.getCorreo());
            return new LoginResponse(token);

        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
}
