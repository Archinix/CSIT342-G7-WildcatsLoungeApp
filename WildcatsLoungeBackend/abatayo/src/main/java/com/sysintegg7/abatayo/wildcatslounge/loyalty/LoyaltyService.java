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
            .findByUserOrderByIdDesc(user)
                .stream()
                .limit(20)
                .map(t -> new LoyaltyTransactionDTO(
                t.getPointsEarned() - t.getPointsRedeemed(),
                        t.getTransactionType(),
                t.getPointsRedeemed() > 0 ? "Redeemed points" : "Points earned",
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

        LoyaltyTransactionEntity tx = new LoyaltyTransactionEntity();
        tx.setUser(user);
        tx.setOrder(null);
        tx.setPointsEarned(0);
        tx.setPointsRedeemed(pointsToRedeem);
        tx.setTransactionType("POINTS_REDEEMED");
        tx.setCreatedAt(String.valueOf(System.currentTimeMillis()));
        loyaltyTransactionRepository.save(tx);

        return getStatus(email);
    }

    public void addPoints(RegisterEntity user, Integer points, String type, String note) {
        LoyaltyPointsEntity pointsEntity = getOrCreatePoints(user);
        pointsEntity.setPoints(pointsEntity.getPoints() + points);
        loyaltyPointsRepository.save(pointsEntity);

        LoyaltyTransactionEntity tx = new LoyaltyTransactionEntity();
        tx.setUser(user);
        tx.setOrder(null);
        tx.setPointsEarned(points);
        tx.setPointsRedeemed(0);
        tx.setTransactionType(type);
        tx.setCreatedAt(String.valueOf(System.currentTimeMillis()));
        loyaltyTransactionRepository.save(tx);
    }

    private LoyaltyPointsEntity getOrCreatePoints(RegisterEntity user) {
        return loyaltyPointsRepository.findByUser(user)
                .orElseGet(() -> loyaltyPointsRepository.save(new LoyaltyPointsEntity(null, user, 0)));
    }
}
