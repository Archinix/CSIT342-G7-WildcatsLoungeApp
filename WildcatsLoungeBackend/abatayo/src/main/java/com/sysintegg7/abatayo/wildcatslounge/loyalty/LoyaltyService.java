package com.sysintegg7.abatayo.wildcatslounge.loyalty;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterEntity;
import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LoyaltyService {

    private final LoyaltyPointsRepository loyaltyPointsRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final RegisterRepository registerRepository;

    public LoyaltyService(LoyaltyPointsRepository loyaltyPointsRepository,
                          LoyaltyTransactionRepository loyaltyTransactionRepository,
                          RegisterRepository registerRepository) {
        this.loyaltyPointsRepository = loyaltyPointsRepository;
        this.loyaltyTransactionRepository = loyaltyTransactionRepository;
        this.registerRepository = registerRepository;
    }

    public LoyaltyStatusDTO getStatus(String email) {
        RegisterEntity user = registerRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return null;
        }

        LoyaltyPointsEntity pointsEntity = getOrCreatePoints(user);
        List<LoyaltyTransactionDTO> tx = loyaltyTransactionRepository
                .findByLoyaltyPointsOrderByIdDesc(pointsEntity)
                .stream()
                .limit(20)
                .map(t -> new LoyaltyTransactionDTO(
                        t.getPointsDelta(),
                        t.getTransactionType(),
                        t.getNote(),
                        t.getCreatedAt()
                ))
                .toList();

        return new LoyaltyStatusDTO(user.getEmail(), pointsEntity.getPoints(), tx);
    }

    public LoyaltyStatusDTO redeem(String email, Integer pointsToRedeem) {
        RegisterEntity user = registerRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return null;
        }

        LoyaltyPointsEntity pointsEntity = getOrCreatePoints(user);
        if (pointsEntity.getPoints() < pointsToRedeem) {
            return null;
        }

        pointsEntity.setPoints(pointsEntity.getPoints() - pointsToRedeem);
        loyaltyPointsRepository.save(pointsEntity);

        LoyaltyTransactionEntity tx = new LoyaltyTransactionEntity(
                null,
                pointsEntity,
                -pointsToRedeem,
                "POINTS_REDEEMED",
                "Redeemed points",
                String.valueOf(System.currentTimeMillis())
        );
        loyaltyTransactionRepository.save(tx);

        return getStatus(email);
    }

    public void addPoints(RegisterEntity user, Integer points, String type, String note) {
        LoyaltyPointsEntity pointsEntity = getOrCreatePoints(user);
        pointsEntity.setPoints(pointsEntity.getPoints() + points);
        loyaltyPointsRepository.save(pointsEntity);

        LoyaltyTransactionEntity tx = new LoyaltyTransactionEntity(
                null,
                pointsEntity,
                points,
                type,
                note,
                String.valueOf(System.currentTimeMillis())
        );
        loyaltyTransactionRepository.save(tx);
    }

    private LoyaltyPointsEntity getOrCreatePoints(RegisterEntity user) {
        return loyaltyPointsRepository.findByUser(user)
                .orElseGet(() -> loyaltyPointsRepository.save(new LoyaltyPointsEntity(null, user, 0)));
    }
}
