<?php

namespace App\Form\Type;

use App\Entity\Lesson;
use App\Entity\LessonSection;
use App\Subscriber\HashPasswordSubscriber;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class LessonSectionType extends AbstractType
{
    public function __construct(
        private readonly HashPasswordSubscriber $subscriber
    ) {
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('type', ChoiceType::class, [
                'choices' => [
                    'Text' => 'text',
                    'Widget' => 'widget',
                    'Question' => 'question',
                ],
            ])
            ->add('content', TextareaType::class, [
                'required' => false,
            ])
            ->add('position', IntegerType::class)
            ->add('questionPrompt', TextareaType::class, [
                'required' => false,
            ])
            ->add('questionType', ChoiceType::class, [
                'required' => false,
                'choices' => [
                    'Text' => 'text',
                    'Number' => 'number',
                    'Checkbox' => 'checkbox',
                    'Radio' => 'radio',
                ],
            ])
            ->add('questionExplanation', TextareaType::class, [
                'required' => false,
            ])
            ->add('correctAnswer', TextType::class, [
                'required' => false,
            ])
            ->add('questionOptions', CollectionType::class, [
                'entry_type' => QuestionOptionType::class,
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
                'required' => false,
            ]);

        $builder->addEventSubscriber($this->subscriber);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => LessonSection::class,
            'csrf_protection' => true,
            'csrf_field_name' => '_token',
            'csrf_token_id' => 'lesson_section_item',
        ]);
    }

    public function getBlockPrefix(): string
    {
        return 'lesson_section';
    }
}
